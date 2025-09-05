import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';

import { env } from './config/env.js';
import { connectDB } from './db/mongoose.js';
import { burstLimiter } from './middleware/rateLimit.js';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import screenRoutes from './routes/screens.js';
import divisionRoutes from './routes/divisions.js';
import kpiRoutes from './routes/kpis.js';
import formDefRoutes from './routes/formDefs.js';
import dataEntryRoutes from './routes/dataEntries.js';
import metricRoutes from './routes/metrics.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: [env.corsOrigin], credentials: true }));
app.use(express.json());
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));
app.use(burstLimiter);

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use(env.apiBase + '/auth', authRoutes);
app.use(env.apiBase + '/users', userRoutes);
app.use(env.apiBase + '/screens', screenRoutes);
app.use(env.apiBase + '/divisions', divisionRoutes);
app.use(env.apiBase + '/kpis', kpiRoutes);
app.use(env.apiBase + '/form-defs', formDefRoutes);
app.use(env.apiBase + '/data-entries', dataEntryRoutes);
app.use(env.apiBase + '/metrics', metricRoutes);

connectDB().then(() => {
  app.listen(env.port, () => {
    console.log(`App listening on :${env.port} ${env.apiBase}`);
  });
});
