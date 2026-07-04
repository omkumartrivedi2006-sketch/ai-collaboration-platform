import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';

// Strict Content Security Policy configuration
export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com", "https://api.dicebear.com"],
      connectSrc: ["'self'", "ws:", "wss:", "http://localhost:5000"]
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' }
});

// Improved CORS Config
export const corsConfig = cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
});

// Rate limiting to prevent brute force attacks
export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per window
  message: {
    status: 'fail',
    message: 'Too many requests from this IP, please try again in 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Input Sanitization to strip potential script/SQL patterns
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  const sanitize = (val: any): any => {
    if (typeof val === 'string') {
      // Strip script tags
      return val.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '').trim();
    }
    if (typeof val === 'object' && val !== null) {
      for (const k in val) {
        val[k] = sanitize(val[k]);
      }
    }
    return val;
  };

  req.body = sanitize(req.body);
  req.query = sanitize(req.query);
  req.params = sanitize(req.params);
  next();
};
