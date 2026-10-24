import express from 'express';
import cors from 'cors';
import { authRoutes } from './routes/authRoutes';
import { errorHandler } from './middleware/errorHandler';

// The app is built here and exported separately from server.ts
// so tests can import it without opening a network port.
export const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);

// Keep this after all routes.
app.use(errorHandler);