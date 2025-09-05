import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import User from '../models/User.js';
import { unauthorized, forbidden } from '../utils/http.js';

export async function requireAuth(req, res, next) {
  try {
    const hdr = req.headers.authorization || '';
    const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : null;
    if (!token) return unauthorized(res);
    const payload = jwt.verify(token, env.jwt.accessSecret); // no exp claim
    const user = await User.findById(payload.sub).populate('screenAccess', 'key name').lean();
    if (!user || !user.isActive) return forbidden(res, 'User disabled');
    req.user = user;
    next();
  } catch {
    return unauthorized(res);
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return unauthorized(res);
    if (!roles.includes(req.user.role)) return forbidden(res);
    next();
  };
}

export function requireScreen(screenKey) {
  return (req, res, next) => {
    if (!req.user) return unauthorized(res);
    const allowed = (req.user.screenAccess || []).some(s => s.key === screenKey);
    if (!allowed) return forbidden(res, `No access to ${screenKey}`);
    next();
  };
}
