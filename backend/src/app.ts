import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { authRoutes } from './routes/authRoutes';
import { vehicleRoutes } from './routes/vehicleRoutes';
import { errorHandler } from './middleware/errorHandler';

// The app is built here and exported separately from server.ts
// so tests can import it without opening a network port.
export const app = express();

// Behind a hosting proxy (like Render) the real client IP is in X-Forwarded-For.
// Without this, every visitor would look like the same IP and share one rate limit.
app.set('trust proxy', 1);

app.use(helmet());
// In production FRONTEND_URL is the website's address (no trailing slash); unset means any origin.
app.use(cors({ origin: process.env.FRONTEND_URL || true }));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);

// Keep this after all routes.
app.use(errorHandler);