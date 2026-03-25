import { createTask, getTaskById, updateTaskStatus } from '../src/services/task.service';
import { TaskStatus, Priority } from '../src/models';
import { ValidationError } from '../src/errors/validation.error';
import { NotFoundError } from '../src/errors/not-found.error';
import { TaskBlockedError } from '../src/errors/task-blocked.error';

// Mock entire repository layer
jest.mock('../src/repositories/task.repository');
jest.mock('../src/repositories/user.repository');

import * as taskRepository from '../src/repositories/task.repository';
import * as userRepository from '../src/repositories/user.repository';

const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  firstName: 'Alice',
  lastName: 'Smith',
  department: 'Engineering',
  role: 'DEVELOPER' as any,
  isActive: true,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

const mockTask = {
  id: 'task-1',
  title: 'Test Task',
  description: 'A test task',
  priority: Priority.HIGH,
  status: TaskStatus.TO_DO,
  assignedUserId: 'user-1',
  estimatedCompletionDate: '2026-12-31',
  completedAt: null,
  createdBy: 'user-1',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('createTask', () => {
  it('creates a task with valid data', () => {
    (userRepository.findById as jest.Mock).mockReturnValue(mockUser);
    (taskRepository.create as jest.Mock).mockReturnValue(mockTask);

    const result = createTask({
      title: 'Test Task',
      description: 'A test task',
      priority: 'HIGH',
      assignedUserId: 'user-1',
      estimatedCompletionDate: '2026-12-31',
      createdBy: 'user-1',
    });

    expect(result).toEqual(mockTask);
    expect(taskRepository.create).toHaveBeenCalled();
  });

  it('throws ValidationError when title is missing', () => {
    (userRepository.findById as jest.Mock).mockReturnValue(mockUser);

    expect(() =>
      createTask({
        title: '',
        description: '',
        priority: 'HIGH',
        assignedUserId: 'user-1',
        estimatedCompletionDate: '2026-12-31',
        createdBy: 'user-1',
      })
    ).toThrow(ValidationError);
  });

  it('throws ValidationError when priority is invalid', () => {
    (userRepository.findById as jest.Mock).mockReturnValue(mockUser);

    expect(() =>
      createTask({
        title: 'Test',
        description: '',
        priority: 'URGENT',
        assignedUserId: 'user-1',
        estimatedCompletionDate: '2026-12-31',
        createdBy: 'user-1',
      })
    ).toThrow(ValidationError);
  });

  it('throws ValidationError when assignedUserId does not exist', () => {
    (userRepository.findById as jest.Mock).mockReturnValue(undefined);

    expect(() =>
      createTask({
        title: 'Test',
        description: '',
        priority: 'HIGH',
        assignedUserId: 'nonexistent-user',
        estimatedCompletionDate: '2026-12-31',
        createdBy: 'user-1',
      })
    ).toThrow(ValidationError);
  });
});

describe('getTaskById', () => {
  it('throws NotFoundError when task not found', () => {
    (taskRepository.findById as jest.Mock).mockReturnValue(undefined);

    expect(() => getTaskById('nonexistent-id')).toThrow(NotFoundError);
  });
});

describe('updateTaskStatus', () => {
  it('throws NotFoundError when task not found', () => {
    (taskRepository.findById as jest.Mock).mockReturnValue(undefined);

    expect(() =>
      updateTaskStatus('nonexistent-id', TaskStatus.IN_PROGRESS, 'user-1', 'Starting work')
    ).toThrow(NotFoundError);
  });

  it('throws TaskBlockedError when dependency is not completed', () => {
    (taskRepository.findById as jest.Mock).mockReturnValue(mockTask);
    (taskRepository.findDependencies as jest.Mock).mockReturnValue([
      { id: 'dep-1', taskId: 'task-1', dependsOnTaskId: 'task-dep-1', createdBy: 'user-1', createdAt: '2024-01-01T00:00:00.000Z' },
    ]);
    // The dependency task is IN_PROGRESS (not COMPLETED)
    (taskRepository.findById as jest.Mock).mockImplementation((id: string) => {
      if (id === 'task-1') return mockTask;
      if (id === 'task-dep-1') return { ...mockTask, id: 'task-dep-1', status: TaskStatus.IN_PROGRESS };
      return undefined;
    });

    expect(() =>
      updateTaskStatus('task-1', TaskStatus.IN_PROGRESS, 'user-1', 'Starting work')
    ).toThrow(TaskBlockedError);
  });
});
