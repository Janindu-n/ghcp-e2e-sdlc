import { Task, TaskStatus, TaskStatusHistory, TaskDependency, Priority } from '../models';
import * as taskRepository from '../repositories/task.repository';
import * as userRepository from '../repositories/user.repository';
import { ValidationError } from '../errors/validation.error';
import { NotFoundError } from '../errors/not-found.error';
import { TaskBlockedError } from '../errors/task-blocked.error';

export interface CreateTaskPayload {
  title: string;
  description: string;
  priority: string;
  assignedUserId: string;
  estimatedCompletionDate: string;
  createdBy: string;
  completedAt?: string | null;
}

export function createTask(payload: CreateTaskPayload): Task {
  const fields: Record<string, string> = {};

  if (!payload.title || payload.title.trim() === '') {
    fields['title'] = 'Title is required';
  }

  if (!payload.priority || !Object.values(Priority).includes(payload.priority as Priority)) {
    fields['priority'] = 'Priority must be LOW, MEDIUM, or HIGH';
  }

  if (!payload.estimatedCompletionDate || isNaN(Date.parse(payload.estimatedCompletionDate))) {
    fields['estimatedCompletionDate'] = 'estimatedCompletionDate must be a valid ISO date';
  }

  if (!payload.assignedUserId || !userRepository.findById(payload.assignedUserId)) {
    fields['assignedUserId'] = 'assignedUserId does not correspond to an existing user';
  }

  if (Object.keys(fields).length > 0) {
    throw new ValidationError('Validation failed', fields);
  }

  return taskRepository.create({
    title: payload.title.trim(),
    description: payload.description || '',
    priority: payload.priority as Priority,
    status: TaskStatus.TO_DO,
    assignedUserId: payload.assignedUserId,
    estimatedCompletionDate: payload.estimatedCompletionDate,
    completedAt: payload.completedAt ?? null,
    createdBy: payload.createdBy,
  });
}

export function listTasks(
  filters?: Partial<Task>,
  page?: number,
  limit?: number
): { data: Task[]; total: number } {
  return taskRepository.findAll(filters, page, limit);
}

export function getTaskById(
  id: string
): Task & { statusHistory: TaskStatusHistory[]; dependencies: TaskDependency[] } {
  const task = taskRepository.findById(id);
  if (!task) throw new NotFoundError(`Task with id '${id}' not found`);

  const statusHistory = taskRepository.findStatusHistory(id);
  const dependencies = taskRepository.findDependencies(id);

  return { ...task, statusHistory, dependencies };
}

export function updateTaskStatus(
  id: string,
  newStatus: TaskStatus,
  changedBy: string,
  note: string
): Task {
  const task = taskRepository.findById(id);
  if (!task) throw new NotFoundError(`Task with id '${id}' not found`);

  if (newStatus === TaskStatus.IN_PROGRESS || newStatus === TaskStatus.COMPLETED) {
    const deps = taskRepository.findDependencies(id);
    for (const dep of deps) {
      const depTask = taskRepository.findById(dep.dependsOnTaskId);
      if (!depTask || depTask.status !== TaskStatus.COMPLETED) {
        throw new TaskBlockedError(
          `Task '${id}' is blocked: dependency '${dep.dependsOnTaskId}' is not completed`
        );
      }
    }
  }

  const updated = taskRepository.updateStatus(id, newStatus, changedBy, note);
  if (!updated) throw new NotFoundError(`Task with id '${id}' not found`);
  return updated;
}

export function getProjectSummary(): {
  total: number;
  completed: number;
  inProgress: number;
  blocked: number;
  toDo: number;
} {
  const { data: tasks } = taskRepository.findAll(undefined, 1, Number.MAX_SAFE_INTEGER);
  return {
    total: tasks.length,
    completed: tasks.filter(t => t.status === TaskStatus.COMPLETED).length,
    inProgress: tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length,
    blocked: tasks.filter(t => t.status === TaskStatus.BLOCKED).length,
    toDo: tasks.filter(t => t.status === TaskStatus.TO_DO).length,
  };
}
