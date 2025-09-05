import { Router } from 'express';
import Joi from 'joi';
import { requireAuth, requireRole } from '../middleware/auth.js';
import Division from '../models/Division.js';
import { created, ok, bad } from '../utils/http.js';

const r = Router();
r.use(requireAuth, requireRole('superadmin', 'admin'));

r.post('/', async (req, res) => {
  const schema = Joi.object({ name: Joi.string().required(), code: Joi.string().required() });
  const { error, value } = schema.validate(req.body);
  if (error) return bad(res, error.message);
  const dup = await Division.findOne({ code: value.code });
  if (dup) return bad(res, 'Division code already exists');
  const div = await Division.create(value);
  return created(res, { division: div });
});

r.get('/', async (_req, res) => {
  const items = await Division.find({ isActive: true }).sort({ name: 1 });
  return ok(res, { items });
});

export default r;
