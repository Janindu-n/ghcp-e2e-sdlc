import { Router } from 'express';
import * as taskController from '../controllers/task.controller';

const router = Router();

router.get('/health', (_req, res) => res.json({ status: 'ok' }));

// IMPORTANT: summary must come before :id
router.get('/tasks/summary', taskController.getProjectSummary);

router.get('/tasks', taskController.listTasks);
router.post('/tasks', taskController.createTask);
router.get('/tasks/:id', taskController.getTaskById);
router.patch('/tasks/:id/status', taskController.updateTaskStatus);

export default router;
