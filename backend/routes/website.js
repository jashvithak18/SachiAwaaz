const express = require('express');
const router = express.Router();
const axios = require('axios');
const Report = require('../models/Report');
const { authMiddleware } = require('../auth');

// Helper to extract the root/parent domain from a hostname
function getRootDomain(hostname) {
  const parts = hostname.toLowerCase().split('.');
  if (parts.length <= 2) return hostname;
  
  const doubleExts = ['co.uk', 'com.in', 'edu.in', 'org.in', 'ac.in', 'gov.in', 'net.in', 'res.in', 'co.in'];
  const lastTwo = parts.slice(-2).join('.');
  if (doubleExts.includes(lastTwo) && parts.length >= 3) {
    return parts.slice(-3).join('.');
  }
  
  return parts.slice(-2).join('.');
}

// Queries real registration details via Registration Data Access Protocol (RDAP)
async function fetchDomainDetails(domain) {
  const rootDomain = getRootDomain(domain);
  let registrar = 'Unknown Registrar';
  let domainAge = 'Unknown Age (Unregistered/Expired)';
  
  try {
    const rdapUrl = `https://rdap.org/domain/${rootDomain}`;
    const response = await axios.get(rdapUrl, { timeout: 3500 });
    if (response.status === 200 && response.data) {
      const data = response.data;
      
      // Parse Registrar
      if (data.entities) {
        const registrarEntity = data.entities.find(e => e.roles && e.roles.includes('registrar'));
        if (registrarEntity && registrarEntity.vcardArray && registrarEntity.vcardArray[1]) {
          const fnProp = registrarEntity.vcardArray[1].find(p => p[0] === 'fn');
          if (fnProp) registrar = fnProp[3];
        }
      }
      
      // Parse Registration Date
      if (data.events) {
        const regEvent = data.events.find(e => e.eventAction === 'registration');
        if (regEvent && regEvent.eventDate) {
          const regDate = new Date(regEvent.eventDate);
          const now = new Date();
          const diffTime = Math.abs(now - regDate);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays < 30) {
            domainAge = `${diffDays} days ago (Newly registered)`;
          } else if (diffDays < 365) {
            const months = Math.floor(diffDays / 30);
            domainAge = `${months} month${months > 1 ? 's' : ''} ago`;
          } else {
            const years = Math.floor(diffDays / 365);
            const months = Math.floor((diffDays % 365) / 30);
            domainAge = `${years} year${years > 1 ? 's' : ''}${months > 0 ? `, ${months} month${months > 1 ? 's' : ''}` : ''}`;
          }
        }
      }
    }
  } catch (err) {
    console.error(`RDAP lookup failed for ${rootDomain}:`, err.message);
  }
  
  return { registrar, domainAge };
}

// Crawls target website HTML source code for live indicators
async function scanWebsiteHtml(url) {
  const trackersFound = [];
  let pageTitle = '';
  let containsPasswordInput = false;
  let containsOtpInput = false;
  let containsReviewsMention = false;
  let pageContentSnippet = 'Could not fetch page text content.';
  let loadSuccess = false;
  
  try {
    const response = await axios.get(url, {
      timeout: 4500,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) PARAKH/1.0 (Digital Trust Audit Crawler)'
      }
    });
    
    if (response.status === 200 && response.data) {
      loadSuccess = true;
      const htmlSource = response.data;
      const lowerHtml = htmlSource.toLowerCase();
      
      // 1. Extract Page Title
      const titleMatch = htmlSource.match(/<title>([^<]+)<\/title>/i);
      if (titleMatch) pageTitle = titleMatch[1].trim();
      
      // 2. Scan for Trackers
      if (lowerHtml.includes('googletagmanager.com/gtag/js') || lowerHtml.includes('google-analytics.com/analytics.js') || lowerHtml.includes('_ga')) {
        trackersFound.push('Google Analytics');
      }
      if (lowerHtml.includes('connect.facebook.net') || lowerHtml.includes('fbq(')) {
        trackersFound.push('Facebook Pixel');
      }
      if (lowerHtml.includes('clarity.ms')) {
        trackersFound.push('Microsoft Clarity');
      }
      if (lowerHtml.includes('static.hotjar.com') || lowerHtml.includes('hj(')) {
        trackersFound.push('Hotjar Tracking');
      }
      if (lowerHtml.includes('tiktok.com/sdk')) {
        trackersFound.push('TikTok Pixel');
      }
      
      // 3. Scan for Sensitive Fields
      if (lowerHtml.includes('type="password"') || lowerHtml.includes("type='password'")) {
        containsPasswordInput = true;
      }
      if (lowerHtml.includes('otp') || lowerHtml.includes('one-time password') || lowerHtml.includes('one time password')) {
        containsOtpInput = true;
      }
      
      // 4. Scan for reviews/testimonials
      if (lowerHtml.includes('review') || lowerHtml.includes('reviews') || lowerHtml.includes('testimonial') || lowerHtml.includes('testimonials') || lowerHtml.includes('rating') || lowerHtml.includes('feedback')) {
        containsReviewsMention = true;
      }
      
      // 5. Clean text content snippet
      const cleanText = htmlSource.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      pageContentSnippet = cleanText.substring(0, 200) + '...';
    }
  } catch (err) {
    console.error(`HTML crawl failed for ${url}:`, err.message);
  }
  
  return {
    loadSuccess,
    pageTitle,
    trackersFound,
    containsPasswordInput,
    containsOtpInput,
    containsReviewsMention,
    pageContentSnippet
  };
}

router.post('/verify', authMiddleware, async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ message: 'URL is required.' });
  }

  try {
    let cleanUrl = url.trim();
    if (!/^https?:\/\//i.test(cleanUrl)) {
      cleanUrl = 'http://' + cleanUrl;
    }

    let urlObj;
    try {
      urlObj = new URL(cleanUrl);
    } catch (e) {
      return res.status(400).json({ message: 'Invalid URL format.' });
    }

    const domain = urlObj.hostname;
    const isHttps = urlObj.protocol === 'https:';
    const isShortened = /^(bit\.ly|tinyurl\.com|t\.co|goo\.gl|rebrand\.ly|ow\.ly|is\.gd|buff\.ly)$/i.test(domain);

    // Analyze domain name for homograph phishing / lookalikes
    const isHomograph = /[\u0400-\u04FF\u0370-\u03FF]/g.test(domain);

    // 1. Perform live html crawl scan
    const htmlScan = await scanWebsiteHtml(cleanUrl);

    // 2. Perform live registrar/WHOIS details query
    let registrar = 'Unknown Registrar';
    let domainAge = 'Unknown Age';
    let isCloudSubdomain = false;
    let cloudLabel = '';

    const cloudProviders = [
      { domain: 'vercel.app', label: 'Vercel Cloud Platform' },
      { domain: 'netlify.app', label: 'Netlify Cloud Platform' },
      { domain: 'github.io', label: 'GitHub Pages' },
      { domain: 'pages.dev', label: 'Cloudflare Pages' },
      { domain: 'onrender.com', label: 'Render Cloud Platform' },
      { domain: 'firebaseapp.com', label: 'Google Firebase' },
      { domain: 'herokuapp.com', label: 'Heroku Cloud' },
      { domain: 'glitch.me', label: 'Glitch App Platform' },
      { domain: 'weebly.com', label: 'Weebly Site Builder' },
      { domain: 'wixsite.com', label: 'Wix Site Builder' }
    ];
    const matchedCloud = cloudProviders.find(p => domain.toLowerCase().endsWith('.' + p.domain));

    if (matchedCloud) {
      isCloudSubdomain = true;
      cloudLabel = matchedCloud.label;
      registrar = `${matchedCloud.label} (Subdomain Hosting)`;
      domainAge = 'Unknown (Dynamically created subdomain)';
    } else {
      const liveDetails = await fetchDomainDetails(domain);
      registrar = liveDetails.registrar;
      domainAge = liveDetails.domainAge;
    }

    // 3. Scan keywords
    const suspiciousKeywords = [];
    const scamWords = ['login', 'secure', 'verify', 'update', 'banking', 'refund', 'bonus', 'free', 'parttime', 'job', 'gift', 'upi', 'pay', 'wallet', 'reward', 'kyc', 'aadhaar', 'pan'];
    scamWords.forEach(word => {
      if (domain.toLowerCase().includes(word) || urlObj.pathname.toLowerCase().includes(word) || (htmlScan.pageTitle && htmlScan.pageTitle.toLowerCase().includes(word))) {
        suspiciousKeywords.push(word);
      }
    });

    // Check for Piracy, Torrent, or Illegal Streaming/Distribution hubs
    const piracyKeywords = [
      'torrent', 'torrents', 'yts', '1337x', 'rarbg', 'piratebay', 'thepiratebay',
      'kickass', 'extratorrent', 'fmovies', 'solarmovie', '123movies', 'putlocker',
      'popcorntime', 'soap2day', 'filmyzilla', 'tamilrockers', 'movierulz', 'netmirror',
      'mp4upload', 'vidcloud', 'upstream', 'doodstream', 'openload', 'rapidgator',
      'uptobox', 'zippyshare', 'flixer', 'hdtoday'
    ];

    const contentPiracyKeywords = [
      'watch online', 'free movie', 'free movies', 'watch free', 'download movie',
      'torrent download', 'streaming online', 'hd movie', 'dual audio', 'watch hd',
      'unauthorized streaming', 'illegal stream'
    ];

    let hasPiracySignals = false;
    const matchedPiracyKeywords = [];

    piracyKeywords.forEach(kw => {
      if (domain.toLowerCase().includes(kw) || urlObj.pathname.toLowerCase().includes(kw) || (htmlScan.pageTitle && htmlScan.pageTitle.toLowerCase().includes(kw))) {
        matchedPiracyKeywords.push(kw);
        hasPiracySignals = true;
      }
    });

    contentPiracyKeywords.forEach(kw => {
      if (htmlScan.pageContentSnippet && htmlScan.pageContentSnippet.toLowerCase().includes(kw)) {
        matchedPiracyKeywords.push(kw);
        hasPiracySignals = true;
      }
    });

    let trustScore = 95;
    const anomalies = [];

    if (hasPiracySignals) {
      trustScore -= 30;
      anomalies.push(`Illegal Streaming / Piracy Portal: Domain or content metadata matches indexers/streaming hubs for copyrighted material (keywords: ${matchedPiracyKeywords.slice(0, 5).join(', ')}). These sites represent high malware, cryptojacking, and adware redirect risks.`);
    }

    if (isCloudSubdomain) {
      trustScore -= 20;
      anomalies.push(`Shared Hosting Subdomain: This page is hosted on a free/shared cloud platform (${cloudLabel}). Subdomains can be created instantly by anyone for deployment, requiring manual verification.`);
    }

    if (!isHttps) {
      anomalies.push('Insecure connection (HTTP only). Data is unencrypted.');
      trustScore -= 20;
    }
    if (isShortened) {
      anomalies.push('Shortened URL domain masking the final destination.');
      trustScore -= 15;
    }
    if (isHomograph) {
      anomalies.push('Homograph phishing pattern: contains non-latin lookalike characters.');
      trustScore -= 40;
    }
    if (suspiciousKeywords.length > 0) {
      anomalies.push(`Suspicious scam-related keywords detected: ${suspiciousKeywords.join(', ')}`);
      trustScore -= 10 * suspiciousKeywords.length;
    }

    // Crawler anomalies
    if (!htmlScan.loadSuccess) {
      anomalies.push('Crawl Alert: Website failed to load or returned a connection timeout. The target could be offline or actively blocking scanners.');
      trustScore -= 15;
    } else {
      if (htmlScan.containsPasswordInput && isCloudSubdomain) {
        anomalies.push('CRITICAL: Password input forms detected on an unverified shared cloud subdomain. High risk of credentials harvesting.');
        trustScore -= 45;
      }
      if (htmlScan.containsOtpInput && isCloudSubdomain) {
        anomalies.push('CRITICAL: OTP request forms detected on an unverified shared cloud subdomain. High risk of financial/identity bypass scams.');
        trustScore -= 45;
      }
      if (htmlScan.containsReviewsMention) {
        anomalies.push('Content Scan: Legitimacy reviews or customer rating sections were detected on this page.');
      }
    }

    // Safety Rating and Verdict adjustments
    let safetyRating = 'safe';
    if (trustScore < 45 || isHomograph) {
      safetyRating = 'dangerous';
      trustScore = Math.max(10, trustScore);
    } else if (trustScore < 75) {
      safetyRating = 'suspicious';
      trustScore = Math.max(30, trustScore);
    }

    const riskScore = 100 - trustScore;
    const verdict = safetyRating === 'safe' ? 'safe' : (safetyRating === 'suspicious' ? 'suspicious' : 'manipulated');

    // === Website Forensic Summary Builder ===
    let explanationParts = [];
    explanationParts.push(`🌐 [Website Security & Domain Forensics]`);
    explanationParts.push(`- Domain name: ${domain}`);
    explanationParts.push(`- Connection Security: ${isHttps ? '🔒 Secure HTTPS Active' : '🔓 Insecure HTTP Only'}`);
    explanationParts.push(`- Registrar Name: ${registrar}`);
    explanationParts.push(`- Domain Age: ${domainAge}`);

    explanationParts.push(`\n🔍 [Source Code Crawl & Testimonials]`);
    explanationParts.push(`- Page Title: "${htmlScan.pageTitle || 'No Title Available'}"`);
    explanationParts.push(`- Marketing Trackers: ${htmlScan.trackersFound.length > 0 ? htmlScan.trackersFound.join(', ') : 'None detected'}`);
    explanationParts.push(`- Sensitive Form Fields: ${htmlScan.containsPasswordInput ? '⚠️ Password input field detected' : 'None'}${htmlScan.containsOtpInput ? ' | ⚠️ OTP request field detected' : ''}`);
    explanationParts.push(`- Reviews/Ratings Mentioned: ${htmlScan.containsReviewsMention ? 'Yes (Contains customer review sections)' : 'No'}`);

    explanationParts.push(`\n⚠️ [Anomalies & Reputation Risk]`);
    if (anomalies.length > 0) {
      anomalies.forEach(a => explanationParts.push(`- Flagged: ${a}`));
    } else {
      explanationParts.push(`- None detected. The domain behaves naturally and does not match phishing signatures.`);
    }

    explanationParts.push(`\n📊 [Threat Verdict]`);
    if (verdict === 'safe') {
      explanationParts.push(`Status: Trusted / Safe. This website has a stable registration history, secure HTTPS protocol, and contains no phishing patterns. It is safe to use.`);
    } else if (verdict === 'suspicious') {
      explanationParts.push(`Status: Warning / Suspicious. Hosted on a shared cloud subdomain with dynamic provisioning, lacks HTTPS, or contains borderline keywords. Do NOT enter sensitive credentials without verifying the source.`);
    } else {
      explanationParts.push(`Status: DANGER / Blocked. Active homograph phishing (lookalike domains), or credential-harvesting password/OTP forms detected on unverified shared subdomains. Close this tab immediately.`);
    }

    const aiExplanation = explanationParts.join('\n');

    const redirectChain = [url];
    if (isShortened) {
      redirectChain.push(`https://${domain}/redirect-handler`);
    }

    const analysisDetails = {
      domain,
      url: cleanUrl,
      httpsAvailable: isHttps,
      sslValid: isHttps,
      domainAge,
      registrar,
      suspiciousKeywords,
      homographPatterns: isHomograph,
      redirectChain,
      shortenedUrl: isShortened,
      trackingDetection: htmlScan.trackersFound,
      unsafeDownloadIndicators: suspiciousKeywords.includes('job') || suspiciousKeywords.includes('parttime'),
      reputationScore: trustScore,
      pageTitle: htmlScan.pageTitle,
      loadSuccess: htmlScan.loadSuccess,
      containsReviews: htmlScan.containsReviewsMention,
      snippet: htmlScan.pageContentSnippet
    };

    const report = new Report({
      userId: req.user.userId,
      fileName: domain,
      fileUrl: cleanUrl,
      mediaType: 'website',
      authenticityScore: trustScore,
      riskScore,
      verdict,
      aiExplanation,
      anomalies,
      analysisDetails
    });

    const savedReport = await report.save();

    // Emit Real-time Notification
    if (req.app.get('io')) {
      const io = req.app.get('io');
      io.to(req.user.userId).emit('notification', {
        title: 'Website Verification Complete',
        message: `Security audit finished for ${domain}. Verdict: ${verdict.toUpperCase()}.`,
        type: verdict === 'safe' ? 'success' : (verdict === 'suspicious' ? 'warning' : 'error')
      });
    }

    res.status(201).json({
      report: savedReport,
      details: analysisDetails
    });

  } catch (err) {
    res.status(500).json({ message: 'Website verification failed: ' + err.message });
  }
});

module.exports = router;
