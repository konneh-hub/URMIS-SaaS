import serverless from 'serverless-http';
import app from '../src/app.js';

export const config = {
  runtime: 'nodejs',
};

export default serverless(app);
