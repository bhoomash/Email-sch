import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import { ZodError } from 'zod';

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  if (err instanceof ZodError) {
    logger.warn({ path: req.path, errors: err.errors }, 'Validation error');
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: err.flatten().fieldErrors,
    });
  }

  if (err instanceof AppError) {
    logger.warn({ path: req.path, code: err.code, statusCode: err.statusCode }, err.message);
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code,
      ...(err.errors ? { errors: err.errors } : {}),
    });
  }

  logger.error({ err, path: req.path }, 'Unhandled server error');

  return res.status(500).json({
    success: false,
    message: 'Internal server error',
    code: 'INTERNAL_SERVER_ERROR',
  });
}
