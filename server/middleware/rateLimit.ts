import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';

// Initialize Redis client
const redis = new Redis(process.env.REDIS_URL);

// Create rate limiters
export const notificationLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'notification-limit:'
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 notifications per hour per phone number
  keyGenerator: (req) => {
    // Use phone number as the key for rate limiting
    return req.body.phone || req.body.From?.replace('whatsapp:', '') || req.ip;
  },
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many notifications sent. Please try again later.'
    });
  }
});

export const webhookLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'webhook-limit:'
  }),
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 webhook requests per minute per phone number
  keyGenerator: (req) => {
    return req.body.From?.replace('whatsapp:', '') || req.ip;
  },
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many requests. Please try again later.'
    });
  }
}); 