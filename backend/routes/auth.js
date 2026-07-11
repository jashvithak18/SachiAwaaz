const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const Setting = require('../models/Setting');
const { authMiddleware, JWT_SECRET } = require('../auth');

// Register User
router.post('/signup', async (req, res) => {
  const { email, password, name, avatar } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Simulate verification token
    const verificationToken = Math.random().toString(36).substring(2, 15);

    const user = new User({
      email,
      password: hashedPassword,
      verificationToken,
      profile: { name, avatar: avatar || '' }
    });

    const savedUser = await user.save();

    // Create default setting for the user
    const setting = new Setting({
      userId: savedUser._id
    });
    await setting.save();

    const token = jwt.sign({ userId: savedUser._id, role: savedUser.role }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: {
        id: savedUser._id,
        email: savedUser.email,
        role: savedUser.role,
        profile: savedUser.profile
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profile: user.profile
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

// Forgot Password — sends real 6-digit OTP to email
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required.' });

  try {
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      // Don't reveal whether the email exists
      return res.json({ message: 'If that email is registered, a reset code has been sent.' });
    }

    // Generate 6-digit code valid for 15 minutes
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetCode       = code;
    user.resetCodeExpiry = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    // Send email via Gmail (forcing IPv4 to bypass Render's IPv6 networking restrictions)
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      family: 4,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"PARAKH" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: `${code} is your PARAKH password reset code`,
      html: `
        <!DOCTYPE html>
        <html>
        <body style="margin:0;padding:0;background:#F6F4EF;font-family:Inter,system-ui,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#F6F4EF;padding:40px 20px;">
            <tr><td align="center">
              <table width="520" cellpadding="0" cellspacing="0"
                style="background:#FBFAF8;border:1px solid #E4E1DA;border-radius:20px;overflow:hidden;max-width:520px;width:100%;">
                <tr>
                  <td style="background:#3E5C4B;padding:28px 40px;">
                    <p style="margin:0;font-size:22px;font-weight:800;color:#fff;">PARAKH</p>
                    <p style="margin:4px 0 0;font-size:12px;color:rgba(255,255,255,0.65);">परखो, फिर भरोसा करो</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:40px;">
                    <p style="margin:0 0 8px;font-size:18px;font-weight:700;color:#181818;">Password Reset Request</p>
                    <p style="margin:0 0 28px;font-size:14px;color:#4b4845;line-height:1.6;">
                      We received a request to reset your PARAKH password. Use the code below — it expires in <strong>15 minutes</strong>.
                    </p>
                    <div style="text-align:center;margin:0 0 28px;">
                      <div style="display:inline-block;background:#F6F4EF;border:2px solid #E4E1DA;border-radius:16px;padding:24px 48px;">
                        <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#666;text-transform:uppercase;letter-spacing:0.12em;">Your reset code</p>
                        <p style="margin:0;font-size:42px;font-weight:900;color:#3E5C4B;letter-spacing:12px;">${code}</p>
                      </div>
                    </div>
                    <p style="margin:0 0 16px;font-size:13px;color:#4b4845;line-height:1.6;">Enter this code on the PARAKH password reset page along with your new password.</p>
                    <p style="margin:0;font-size:12px;color:#999;line-height:1.6;">If you did not request a reset, ignore this email. Your account is safe.</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px 40px;border-top:1px solid #E4E1DA;background:#F6F4EF;">
                    <p style="margin:0;font-size:11px;color:#999;text-align:center;">© 2025 PARAKH · Digital verification for a world where everything looks real.</p>
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>
        </body>
        </html>
      `,
    });

    console.log(`[Auth] Reset code sent to ${email}`);
    res.json({ message: 'Reset code sent. Please check your email.' });
  } catch (err) {
    console.error('[Auth] forgot-password error:', err);
    res.status(500).json({ message: 'Failed to send reset email: ' + err.message });
  }
});

// Reset Password — verify 6-digit OTP and set new password
router.post('/reset-password', async (req, res) => {
  const { email, code, newPassword } = req.body;
  if (!email || !code || !newPassword) {
    return res.status(400).json({ message: 'Email, code, and new password are required.' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters.' });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || !user.resetCode || !user.resetCodeExpiry) {
      return res.status(400).json({ message: 'No reset was requested for this email.' });
    }
    if (user.resetCode !== code.trim()) {
      return res.status(400).json({ message: 'Incorrect reset code. Please check your email.' });
    }
    if (new Date() > user.resetCodeExpiry) {
      user.resetCode = null;
      user.resetCodeExpiry = null;
      await user.save();
      return res.status(400).json({ message: 'Reset code has expired. Please request a new one.' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password        = await bcrypt.hash(newPassword, salt);
    user.resetCode       = null;
    user.resetCodeExpiry = null;
    await user.save();

    res.json({ message: 'Password reset successfully. You can now sign in.' });
  } catch (err) {
    console.error('[Auth] reset-password error:', err);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

// Verify Email (Simulated)
router.post('/verify-email', async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ message: 'Verification token is required.' });
  }

  try {
    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token.' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.json({ message: 'Email verified successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

// Get Profile & Profile update
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

router.put('/profile', authMiddleware, async (req, res) => {
  const { name, avatar } = req.body;
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (name !== undefined) user.profile.name = name;
    if (avatar !== undefined) user.profile.avatar = avatar;

    // Explicitly notify Mongoose of nested profile subdocument modifications
    user.markModified('profile');
    const updatedUser = await user.save();
    res.json({
      id: updatedUser._id,
      email: updatedUser.email,
      role: updatedUser.role,
      profile: updatedUser.profile
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

module.exports = router;
