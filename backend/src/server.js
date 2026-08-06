import logger from './utils/logger.js';
import app from './app.js';
import { PORT } from './config/index.js';

app.listen(PORT, () => {
  logger.info({ port: PORT }, 'Backend server listening');
});
