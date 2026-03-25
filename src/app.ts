import express from 'express';
import taskRoutes from './routes/tasks';
import { errorMiddleware } from './middleware/error.middleware';

export const app = express();

app.use(express.json());
app.use('/api/v1', taskRoutes);
app.use(errorMiddleware);
