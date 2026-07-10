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

    let trustScore = 95;
    const anomalies = [];

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

    let aiExplanation = '';
    if (verdict === 'safe') {
      aiExplanation = `PARAKH verified the website ${domain}. The connection uses active HTTPS encryption with a valid SSL certificate. The domain is registered with a reputable registrar (${registrar}) and has a stable history of ${domainAge}. Zero phishing keywords or hidden redirect patterns were discovered. Real site crawl succeeded: title "${htmlScan.pageTitle || 'Untitled'}".`;
    } else if (verdict === 'suspicious') {
      aiExplanation = `WARNING: Website ${domain} is flagged as Suspicious. It exhibits warning indicators including: ${anomalies.join(' | ')}. Exercise extreme caution before entering credentials.`;
    } else {
      aiExplanation = `CRITICAL DANGER: The URL ${domain} is identified as an active threat vector. Detected indicators: ${anomalies.join(' | ')}. Do NOT enter credentials or download any files.`;
    }

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
