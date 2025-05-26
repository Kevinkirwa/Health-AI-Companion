import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error('Error:', err);

  // Handle MongoDB errors
  if (err instanceof mongoose.Error) {
    if (err instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({
        error: 'Validation Error',
        details: Object.values(err.errors).map(e => e.message)
      });
    }

    if (err instanceof mongoose.Error.CastError) {
      return res.status(400).json({
        error: 'Invalid ID',
        details: `Invalid ${err.path}: ${err.value}`
      });
    }

    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(409).json({
        error: 'Duplicate Error',
        details: `${field} already exists`
      });
    }
  }

  // Handle other errors
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({
    error: message,
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
} 