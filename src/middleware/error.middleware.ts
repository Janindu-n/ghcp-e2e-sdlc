import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/app.error';
import { ValidationError } from '../errors/validation.error';
import { NotFoundError } from '../errors/not-found.error';
import { TaskBlockedError } from '../errors/task-blocked.error';

export function errorMiddleware(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof ValidationError) {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: err.message,
        fields: err.fields,
      },
    });
    return;
  }

  if (err instanceof NotFoundError) {
    res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: err.message,
      },
    });
    return;
  }

  if (err instanceof TaskBlockedError) {
    res.status(422).json({
      success: false,
      error: {
        code: 'TASK_BLOCKED',
        message: err.message,
      },
    });
    return;
  }

  // Unknown errors
  console.error(err);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    },
  });
}
