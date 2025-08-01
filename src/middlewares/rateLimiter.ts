import rateLimit from "express-rate-limit";

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    message: 'Too many login attempts. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const profileEditLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 4, // 4 uploads per window per user/IP
  message: 'Too many profile updates from this IP. Please try again later.',
});
