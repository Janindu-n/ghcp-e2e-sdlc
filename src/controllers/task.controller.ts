import { Request, Response, NextFunction } from 'express';
import * as taskService from '../services/task.service';
import { TaskStatus } from '../models';

export async function createTask(req: Request, res: Response, next: NextFunction): Promise<void> {
  const start = Date.now();
  try {
    const task = taskService.createTask(req.body);
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} 201 ${duration}ms`);
    res.status(201).json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
}

export async function listTasks(req: Request, res: Response, next: NextFunction): Promise<void> {
  const start = Date.now();
  try {
    const page = parseInt(req.query['page'] as string) || 1;
    const limit = parseInt(req.query['limit'] as string) || 20;
    const { data, total } = taskService.listTasks(undefined, page, limit);
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} 200 ${duration}ms`);
    res.json({ success: true, data, meta: { total, page, limit } });
  } catch (err) {
    next(err);
  }
}

export async function getTaskById(req: Request, res: Response, next: NextFunction): Promise<void> {
  const start = Date.now();
  try {
    const task = taskService.getTaskById(req.params['id']!);
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} 200 ${duration}ms`);
    res.json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
}

export async function updateTaskStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  const start = Date.now();
  try {
    const { status, changedBy, note } = req.body as { status: TaskStatus; changedBy: string; note: string };
    const task = taskService.updateTaskStatus(req.params['id']!, status, changedBy, note || '');
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} 200 ${duration}ms`);
    res.json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
}

export async function getProjectSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
  const start = Date.now();
  try {
    const summary = taskService.getProjectSummary();
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} 200 ${duration}ms`);
    res.json({ success: true, data: summary });
  } catch (err) {
    next(err);
  }
}
