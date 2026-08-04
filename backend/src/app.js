import express from 'express';

const app = express();

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'urmis-backend' });
});

export default app;
