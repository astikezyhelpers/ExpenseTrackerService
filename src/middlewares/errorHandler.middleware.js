import { BaseException } from '../utils/exception/BaseException.js';

export const errorHandler = (err, req, res, next) => {
  const statusCode = err instanceof BaseException ? err.statusCode : 500;

  return res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || "INTERNAL_ERROR",
      message: err.message || "Something went wrong",
      details: err.details || [],
    },
    meta: {
      requestId: req.id || "N/A", // Add request ID middleware if needed
      timestamp: new Date().toISOString()
    }
  });
};
