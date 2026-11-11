/**
 * TwinsTrip Server — Main Entry Point
 * Express + TypeScript backend for the 双胞胎带娃出游作战指挥系统
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import http from 'http';
import { WebSocketServer } from 'ws';

// Import routes
import authRoutes from './routes/auth';
import babyRoutes from './routes/babies';
import tripRoutes from './routes/trips';
import checklistRoutes from './routes/checklists';
import emergencyRoutes from './routes/emergency';
import mapRoutes from './routes/map';
import familyRoutes from './routes/families';

// Import services
import { setupWebSocket } from './services/websocket';

const app = express();
const PORT = process.env.PORT || 3000;

// === Middleware ===
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// === Health Check ===
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'TwinsTrip API',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
  });
});

// === API Routes ===
app.use('/api/auth', authRoutes);
app.use('/api/families', familyRoutes);
app.use('/api/babies', babyRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/checklists', checklistRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/map', mapRoutes);

// === Error Handling ===
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[TwinsTrip] Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message,
  });
});

// === Start Server ===
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

setupWebSocket(wss);

server.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════╗
║        🛰️ TwinsTrip Server            ║
║   双胞胎带娃出游作战指挥系统 API       ║
╠═══════════════════════════════════════╣
║  HTTP:   http://localhost:${PORT}        ║
║  WS:     ws://localhost:${PORT}/ws       ║
║  Env:    ${process.env.NODE_ENV || 'development'.padEnd(16)}║
╚═══════════════════════════════════════╝
  `);
});

export default app;
