import rateLimit from "express-rate-limit";

const authLimitter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true
});

const commonLimitter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20
});

const uploadLimitter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100
});

export { uploadLimitter, commonLimitter, authLimitter };
