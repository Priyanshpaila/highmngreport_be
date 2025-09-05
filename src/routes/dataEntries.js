import { Router } from 'express';
import Joi from 'joi';
import { Validator } from 'jsonschema';
import { requireAuth, requireScreen } from '../middleware/auth.js';
import DataEntry from '../models/DataEntry.js';
import FormDef from '../models/FormDef.js';
import { created, ok, bad } from '../utils/http.js';

const r = Router();
r.use(requireAuth);

// Users with DIVISION_FORM can create/list entries
r.post('/', requireScreen('DIVISION_FORM'), async (req, res) => {
  const schema = Joi.object({
    divisionId: Joi.string().required(),
    definitionKey: Joi.string().required(),
    definitionVersion: Joi.number().integer().required(),
    payload: Joi.object().required()
  });
  const { error, value } = schema.validate(req.body);
  if (error) return bad(res, error.message);

  const def = await FormDef.findOne({ key: value.definitionKey, version: value.definitionVersion, isActive: true }).lean();
  if (!def) return bad(res, 'Invalid form definition version');

  // Validate payload with stored JSON Schema, if provided
  if (def.schema && typeof def.schema === 'object') {
    const v = new Validator();
    const result = v.validate(value.payload, def.schema);
    if (!result.valid) {
      const msg = result.errors.map(e => e.stack).join('; ');
      return bad(res, `Payload validation failed: ${msg}`);
    }
  }

  const entry = await DataEntry.create({
    divisionId: value.divisionId,
    submittedBy: req.user._id,
    definitionKey: value.definitionKey,
    definitionVersion: value.definitionVersion,
    payload: value.payload
  });
  return created(res, { entry });
});

r.get('/', requireScreen('DIVISION_FORM'), async (req, res) => {
  const { divisionId } = req.query;
  const q = divisionId ? { divisionId } : {};
  const items = await DataEntry.find(q).sort({ createdAt: -1 }).limit(100);
  return ok(res, { items });
});

export default r;
