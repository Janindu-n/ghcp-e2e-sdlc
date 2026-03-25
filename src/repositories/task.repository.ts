import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { JsonRepository } from './json-store';
import { Task, TaskStatus, TaskStatusHistory, TaskDependency } from '../models';

const dataDir = path.join(process.cwd(), 'src', 'data');

const taskRepo = new JsonRepository<Task>(path.join(dataDir, 'tasks.json'));
const historyRepo = new JsonRepository<TaskStatusHistory>(path.join(dataDir, 'task_status_history.json'));
const dependencyRepo = new JsonRepository<TaskDependency>(path.join(dataDir, 'task_dependencies.json'));

export function findAll(
  filters?: Partial<Task>,
  page: number = 1,
  limit: number = 20
): { data: Task[]; total: number } {
  const all = taskRepo.findAll(filters);
  const total = all.length;
  const start = (page - 1) * limit;
  const data = all.slice(start, start + limit);
  return { data, total };
}

export function findAllUnpaginated(filters?: Partial<Task>): Task[] {
  return taskRepo.findAll(filters);
}

export function findById(id: string): Task | undefined {
  return taskRepo.findById(id);
}

export function create(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Task {
  const now = new Date().toISOString();
  const task: Task = {
    id: uuidv4(),
    ...taskData,
    createdAt: now,
    updatedAt: now,
  };
  return taskRepo.create(task);
}

export function updateStatus(
  id: string,
  newStatus: TaskStatus,
  changedBy: string,
  note: string
): Task | undefined {
  const task = taskRepo.findById(id);
  if (!task) return undefined;

  const previousStatus = task.status;
  const now = new Date().toISOString();
  const patch: Partial<Task> = {
    status: newStatus,
    updatedAt: now,
    completedAt: newStatus === TaskStatus.COMPLETED ? now : task.completedAt,
  };

  const updated = taskRepo.update(id, patch);

  addStatusHistoryEntry({
    taskId: id,
    previousStatus,
    newStatus,
    changedBy,
    note,
  });

  return updated;
}

export function addStatusHistoryEntry(
  entry: Omit<TaskStatusHistory, 'id' | 'changedAt'>
): TaskStatusHistory {
  const record: TaskStatusHistory = {
    id: uuidv4(),
    ...entry,
    changedAt: new Date().toISOString(),
  };
  return historyRepo.create(record);
}

export function findDependencies(taskId: string): TaskDependency[] {
  return dependencyRepo.findAll({ taskId } as Partial<TaskDependency>);
}

export function findStatusHistory(taskId: string): TaskStatusHistory[] {
  return historyRepo.findAll({ taskId } as Partial<TaskStatusHistory>);
}
