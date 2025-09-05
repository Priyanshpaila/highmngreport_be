import { Router } from 'express';
import Joi from 'joi';
import { requireAuth, requireRole } from '../middleware/auth.js';
import Screen from '../models/Screen.js';
import { created, ok, bad } from '../utils/http.js';

const r = Router();
r.use(requireAuth, requireRole('superadmin'));

r.post('/', async (req, res) => {
  const schema = Joi.object({ key: Joi.string().required(), name: Joi.string().required(), category: Joi.string().optional() });
  const { error, value } = schema.validate(req.body);
  if (error) return bad(res, error.message);
  const exists = await Screen.findOne({ key: value.key });
  if (exists) return bad(res, 'Screen key already exists');
  const screen = await Screen.create(value);
  return created(res, { screen });
});

r.get('/', async (_req, res) => {
  const screens = await Screen.find({ isActive: true }).sort({ key: 1 });
  return ok(res, { items: screens });
});

export default r;
