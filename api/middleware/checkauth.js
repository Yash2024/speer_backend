const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const JWT_KEY = "secret";

// Rate limiting configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

const authenticateMiddleware = (req, res, next) => {
  try {
    // Apply rate limiting before checking JWT
    limiter(req, res, () => {
      const token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, JWT_KEY);
      req.userData = decoded;
      next();
    });
  } catch (error) {
    return res.status(401).json({
      message: 'Auth failed',
    });
  }
};

module.exports = authenticateMiddleware;
