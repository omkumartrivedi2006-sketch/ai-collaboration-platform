import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;

  if (process.env.NODE_ENV === 'development') {
    res.status(statusCode).json({
      status: 'error',
      message: err.message,
      stack: err.stack,
      error: err
    });
  } else {
    if (err.isOperational) {
      res.status(statusCode).json({
        status: 'error',
        message: err.message
      });
    } else {
      console.error('UNEXPECTED ERROR 💥', err);
      res.status(500).json({
        status: 'error',
        message: 'An unexpected server error occurred.'
      });
    }
  }
};

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Endpoint ${req.method} ${req.originalUrl} not found.`, 404));
};
