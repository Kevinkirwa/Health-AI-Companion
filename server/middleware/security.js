/**
 * Security middleware for Health AI Companion API
 * Implements best practices for API security
 */

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const cors = require('cors');

/**
 * Configure and return security middleware
 * @param {Object} app - Express application
 */
const configureSecurity = (app) => {
  // Set security HTTP headers using Helmet
  app.use(helmet());

  // Configure CORS
  app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

  // Rate limiting to prevent brute force and DoS attacks
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  });

  // Apply rate limiting to all requests
  app.use('/api/', apiLimiter);

  // Body parser, reading data from body into req.body
  app.use(express.json({ limit: '10kb' })); // Body limit is 10kb
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));

  // Data sanitization against NoSQL query injection
  app.use(mongoSanitize());

  // Data sanitization against XSS
  app.use(xss());

  // Prevent parameter pollution
  app.use(hpp({
    whitelist: ['date', 'status', 'sort', 'limit', 'page'] // parameters that can be duplicated
  }));

  // Implement API request logging in development
  if (process.env.NODE_ENV === 'development') {
    const morgan = require('morgan');
    app.use(morgan('dev'));
  }

  console.log('Security middleware configured successfully');
};

/**
 * Authentication middleware to protect routes
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const authMiddleware = async (req, res, next) => {
  try {
    // Check for token in Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed. Token not provided.'
      });
    }

    // Extract token from header
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed. Invalid token format.'
      });
    }

    // Verify token and get user data
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user still exists
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User belonging to this token no longer exists.'
      });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Please log in again.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Your token has expired. Please log in again.'
      });
    }

    console.error('Authentication error:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication.'
    });
  }
};

/**
 * Role-based authorization middleware
 * @param {...String} roles - Allowed roles for the route
 * @returns {Function} Middleware function
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Please log in to access this resource.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action.'
      });
    }

    next();
  };
};

module.exports = {
  configureSecurity,
  authMiddleware,
  restrictTo
};
