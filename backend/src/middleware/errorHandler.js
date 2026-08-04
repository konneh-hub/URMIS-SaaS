import logger from '../utils/logger.js';

export default function errorHandler(err, req, res, next) {
  logger.error({ err, path: req.path }, 'Unhandled error');
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  res.status(status).json({ success: false, message });
}
