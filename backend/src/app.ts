import express from 'express';
import cors from 'cors';

// The app is built here and exported separately from server.ts
// so tests can import it without opening a network port.
export const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});