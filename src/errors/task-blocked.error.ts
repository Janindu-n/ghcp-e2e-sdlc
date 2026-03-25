import { AppError } from './app.error';

export class TaskBlockedError extends AppError {
  constructor(message: string) {
    super(message, 422, 'TASK_BLOCKED');
  }
}
