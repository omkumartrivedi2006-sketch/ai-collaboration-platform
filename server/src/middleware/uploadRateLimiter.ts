import rateLimit from 'express-rate-limit';

export const uploadRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // max 20 uploads per minute
  message: {
    status: 'error',
    message: 'Too many file uploads from this IP. Please try again in a minute.'
  },
  standardHeaders: true,
  legacyHeaders: false
});
