import express from 'express';
import bodyParser from 'body-parser';
import logger from './utils/logger.js';
import pinoHttp from 'pino-http';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRoutes from './auth/auth.routes.js';
import adminRoutes from './admin/system.routes.js';
import universityAdminRoutes from './admin/university-admin.routes.js';
import usersRoutes from './admin/users.routes.js';
import rbacRoutes from './admin/rbac.routes.js';
import academicRoutes from './admin/academic.routes.js';
import staffRoutes from './admin/staff.routes.js';
import studentRoutes from './admin/student.routes.js';
import platformRoutes from './admin/platform.routes.js';
import universityRoutes from './university/university.routes.js';
import institutionRoutes from './institution/institution.routes.js';
import studentPortalRoutes from './student/student.routes.js';
import errorHandler from './middleware/errorHandler.js';
import { ensureDefaultSystemAdmin } from './admin/system.service.js';

const app = express();

app.use(pinoHttp({ logger }));
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/university-admins', universityAdminRoutes);
app.use('/api/admin/users', usersRoutes);
app.use('/api/admin/rbac', rbacRoutes);
app.use('/api/admin/academic', academicRoutes);
app.use('/api/admin/staff', staffRoutes);
app.use('/api/admin/students', studentRoutes);
app.use('/api/admin/platform', platformRoutes);
app.use('/api/university', universityRoutes);
app.use('/api/institutions', institutionRoutes);
app.use('/api/institution', institutionRoutes);
app.use('/api/student', studentPortalRoutes);

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'urmis-backend' });
});

app.use(errorHandler);

(async function bootstrap() {
  try {
    const result = await ensureDefaultSystemAdmin();
    logger.info({ created: result.created, email: result.user?.email }, 'System admin bootstrap complete');
  } catch (error) {
    logger.error({ err: error }, 'System admin bootstrap failed');
  }
})();

export default app;
