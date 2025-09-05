import { Router } from 'express';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import { env } from '../config/env.js';
import User from '../models/User.js';
import { hashPassword, verifyPassword } from '../utils/hash.js';
import { ok, created, bad, unauthorized } from '../utils/http.js';
import { authLimiter } from '../middleware/rateLimit.js';

const r = Router();

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

function signAccess(userId) {
  // No expiresIn => permanent token
  return jwt.sign({ sub: String(userId) }, env.jwt.accessSecret);
}

r.post('/login', authLimiter, async (req, res) => {
  const { error, value } = loginSchema.validate(req.body);
  if (error) return bad(res, error.message);

  const user = await User.findOne({ email: value.email });
  if (!user || !user.isActive) return unauthorized(res, 'Invalid credentials');

  const okPwd = await verifyPassword(user.passwordHash, value.password);
  if (!okPwd) return unauthorized(res, 'Invalid credentials');

  const accessToken = signAccess(user._id);
  return ok(res, {
    accessToken,
    user: {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role
    }
  });
});

// optional: noop
r.post('/logout', (_req, res) => ok(res, { success: true }));

// bootstrap first superadmin
r.post('/bootstrap-superadmin', async (req, res) => {
  const count = await User.countDocuments({ role: 'superadmin' });
  if (count > 0) return bad(res, 'Superadmin already exists');
  const { fullName, email, password } = req.body || {};
  if (!fullName || !email || !password) return bad(res, 'fullName, email, password required');
  const passwordHash = await hashPassword(password);
  const user = await User.create({ fullName, email, passwordHash, role: 'superadmin' });
  return created(res, { user: { _id: user._id, fullName, email, role: user.role } });
});

export default r;
