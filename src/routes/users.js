import { Router } from 'express';
import Joi from 'joi';
import { requireAuth, requireRole } from '../middleware/auth.js';
import User from '../models/User.js';
import Screen from '../models/Screen.js';
import { hashPassword } from '../utils/hash.js';
import { created, ok, bad, notFound } from '../utils/http.js';

const r = Router();
r.use(requireAuth, requireRole('superadmin', 'admin'));

r.post('/', async (req, res) => {
  const schema = Joi.object({
    fullName: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('user', 'admin').default('user')
  });
  const { error, value } = schema.validate(req.body);
  if (error) return bad(res, error.message);
  const exists = await User.findOne({ email: value.email });
  if (exists) return bad(res, 'Email already exists');
  const passwordHash = await hashPassword(value.password);
  const user = await User.create({ fullName: value.fullName, email: value.email, passwordHash, role: value.role });
  return created(res, { user: { _id: user._id, fullName: user.fullName, email: user.email, role: user.role } });
});

r.get('/', async (_req, res) => {
  const users = await User.find().select('_id fullName email role isActive screenAccess').populate('screenAccess', 'key name');
  return ok(res, { items: users });
});

r.patch('/:id/screens', async (req, res) => {
  const schema = Joi.object({ screenIds: Joi.array().items(Joi.string()).required() });
  const { error, value } = schema.validate(req.body);
  if (error) return bad(res, error.message);

  const available = await Screen.find({ _id: { $in: value.screenIds }, isActive: true }).select('_id');
  const user = await User.findByIdAndUpdate(req.params.id, { screenAccess: available.map(s => s._id) }, { new: true })
    .select('_id fullName email role screenAccess')
    .populate('screenAccess', 'key name');
  if (!user) return notFound(res, 'User not found');
  return ok(res, { user });
});

r.patch('/:id/status', async (req, res) => {
  const schema = Joi.object({ isActive: Joi.boolean().required() });
  const { error, value } = schema.validate(req.body);
  if (error) return bad(res, error.message);
  const user = await User.findByIdAndUpdate(req.params.id, { isActive: value.isActive }, { new: true }).select('_id isActive');
  if (!user) return notFound(res, 'User not found');
  return ok(res, { user });
});

export default r;
