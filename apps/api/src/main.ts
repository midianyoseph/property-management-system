import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import { authMiddleware } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';
import { propertiesRouter } from './routes/properties';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', authMiddleware, propertiesRouter);

app.use(errorHandler);

const port = Number(process.env.PORT) || 3001;
const host = process.env.HOST || '0.0.0.0';

app.listen(port, host, () => {
  console.log(`API listening on http://${host}:${port}`);
});
