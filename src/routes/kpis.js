import { Router } from 'express';
import Joi from 'joi';
import { requireAuth, requireRole } from '../middleware/auth.js';
import KPI from '../models/KPI.js';
import { created, ok, bad } from '../utils/http.js';

const r = Router();
r.use(requireAuth, requireRole('superadmin', 'admin'));

r.post('/', async (req, res) => {
  const schema = Joi.object({
    key: Joi.string().required(),
    label: Joi.string().required(),
    unit: Joi.string().allow(null, ''),
    decimals: Joi.number().integer().min(0).max(6).default(0),
    category: Joi.string().default('General')
  });
  const { error, value } = schema.validate(req.body);
  if (error) return bad(res, error.message);
  const dup = await KPI.findOne({ key: value.key });
  if (dup) return bad(res, 'KPI key already exists');
  const kpi = await KPI.create(value);
  return created(res, { kpi });
});

r.get('/', async (_req, res) => {
  const items = await KPI.find({ isActive: true }).sort({ key: 1 });
  return ok(res, { items });
});

export default r;
