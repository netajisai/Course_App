import rateLimit from "express-rate-limit"

// Admin Signin Rate Limiter
export const adminLoginLimiter = rateLimit({
    windowMs: 15*60*1000, //15 minutes
    max: 5,
    message: {
      message: "Too many login attempts. Please try again after 15 minutes."
    },
    standardHeaders : true,
    legacyHeaders: false
})

export const userLoginLimiter = {}


const failedAttempts = new Map(); // key: IP, value: { count, lastFailed }

const MAX_ATTEMPTS = 5;
const BLOCK_TIME = 15 * 60 * 1000; // 15 minutes

export function loginRateLimiter(req, res, next) {
  const ip = req.ip;
  const record = failedAttempts.get(ip);

  if (record) {
    const { count, lastFailed } = record;

    // Check if still blocked
    if (count >= MAX_ATTEMPTS && Date.now() - lastFailed < BLOCK_TIME) {
      return res.status(429).json({
        message: `Too many failed login attempts. Try again in ${(BLOCK_TIME / 60000)} minutes.`,
      });
    }

    // If block time passed, reset
    if (Date.now() - lastFailed >= BLOCK_TIME) {
      failedAttempts.delete(ip);
    }
  }

  // Continue to actual login handler
  next();
}
