import express from 'express';
import bodyParser from 'body-parser';
import logger from './utils/logger.js';
import pinoHttp from 'pino-http';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRoutes from './auth/auth.routes.js';
import adminRoutes from './admin/system.routes.js';
import universityRoutes from './university/university.routes.js';
import errorHandler from './middleware/errorHandler.js';
import { PORT } from './config/index.js';

const app = express();

app.use(pinoHttp({ logger }));
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/university', universityRoutes);

app.get('/health', (req, res) => res.json({ ok: true }));

app.use(errorHandler);

app.listen(PORT, () => {
  logger.info({ port: PORT }, 'Backend server listening');
});
