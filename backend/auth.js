const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'verivoice_secret_hackhazards2026';

const authMiddleware = (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    return res.status(401).json({ message: 'No authorization token, access denied.' });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ message: 'Token format is invalid (should be Bearer <token>).' });
  }

  const token = parts[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // holds { userId }
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is invalid or expired, authorization failed.' });
  }
};

module.exports = {
  authMiddleware,
  JWT_SECRET
};
