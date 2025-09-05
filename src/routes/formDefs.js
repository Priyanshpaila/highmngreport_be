import { Router } from 'express';
import Joi from 'joi';
import { requireAuth, requireRole } from '../middleware/auth.js';
import FormDef from '../models/FormDef.js';
import { created, ok, bad } from '../utils/http.js';

const r = Router();
r.use(requireAuth, requireRole('superadmin', 'admin'));

r.post('/', async (req, res) => {
  const schema = Joi.object({
    key: Joi.string().required(),
    version: Joi.number().integer().min(1).required(),
    schema: Joi.object().required(),   // JSON Schema
    uiSchema: Joi.object().default({}),
    isActive: Joi.boolean().default(true)
  });
  const { error, value } = schema.validate(req.body);
  if (error) return bad(res, error.message);
  const def = await FormDef.create(value);
  return created(res, { formDef: def });
});

r.get('/', async (req, res) => {
  const { key, latest } = req.query;
  const q = key ? { key, isActive: true } : { isActive: true };
  if (latest && key) {
    const def = await FormDef.find(q).sort({ version: -1 }).limit(1);
    return ok(res, { items: def });
  }
  const items = await FormDef.find(q).sort({ key: 1, version: -1 });
  return ok(res, { items });
});

export default r;
