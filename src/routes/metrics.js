import { Router } from 'express';
import Joi from 'joi';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
dayjs.extend(utc);

import { requireAuth, requireScreen } from '../middleware/auth.js';
import MetricFact from '../models/MetricFact.js';
import { ok, bad } from '../utils/http.js';

const BUCKETS = { day: '%Y-%m-%d', week: '%G-%V', month: '%Y-%m', quarter: '%Y-Q' };

const r = Router();
r.use(requireAuth, requireScreen('REPORT_DASHBOARD'));

r.get('/series', async (req, res) => {
  const schema = Joi.object({
    divisionId: Joi.string().required(),
    kpis: Joi.string().required(),
    from: Joi.string().isoDate().required(),
    to: Joi.string().isoDate().required(),
    bucket: Joi.string().valid('day', 'week', 'month', 'quarter').default('day'),
    agg: Joi.string().valid('sum', 'avg', 'min', 'max').default('sum'),
    fill: Joi.string().valid('null', 'zero').default('null'),
    format: Joi.string().valid('long', 'wide').default('long')
  });

  const { error, value } = schema.validate(req.query);
  if (error) return bad(res, error.message);

  const kpiArr = value.kpis.split(',').filter(Boolean);
  const dateFmt = BUCKETS[value.bucket] || BUCKETS.day;

  const match = {
    divisionId: value.divisionId,
    kpiKey: { $in: kpiArr },
    ts: { $gte: new Date(value.from), $lte: new Date(value.to) }
  };
  const groupId = { bucket: { $dateToString: { date: '$ts', format: dateFmt } }, kpiKey: '$kpiKey' };
  const valueExpr = { sum: { $sum: '$value' }, avg: { $avg: '$value' }, min: { $min: '$value' }, max: { $max: '$value' } }[value.agg];

  const rows = await MetricFact.aggregate([
    { $match: match },
    { $group: { _id: groupId, value: valueExpr, unit: { $first: '$unit' } } },
    { $project: { _id: 0, bucket: '$_id.bucket', kpiKey: '$_id.kpiKey', value: 1, unit: 1 } },
    { $sort: { bucket: 1 } }
  ]);

  // buckets
  const start = dayjs.utc(value.from).startOf('day');
  const end = dayjs.utc(value.to).startOf('day');
  const buckets = [];
  for (let d = start; d.isBefore(end) || d.isSame(end); ) {
    const label =
      value.bucket === 'month' ? d.format('YYYY-MM')
      : value.bucket === 'week' ? d.format('GGGG-ww')
      : value.bucket === 'quarter' ? `${d.format('YYYY')}-Q${Math.floor(d.month() / 3) + 1}`
      : d.format('YYYY-MM-DD');
    if (!buckets.includes(label)) buckets.push(label);
    d = value.bucket === 'month' ? d.add(1, 'month')
      : value.bucket === 'week' ? d.add(1, 'week')
      : value.bucket === 'quarter' ? d.add(3, 'month')
      : d.add(1, 'day');
  }

  if (value.format === 'wide') {
    const byKpi = Object.fromEntries(kpiArr.map(k => [k, new Array(buckets.length).fill(null)]));
    const unitByKpi = {};
    rows.forEach(rw => {
      const idx = buckets.indexOf(rw.bucket);
      if (idx >= 0) byKpi[rw.kpiKey][idx] = rw.value ?? null;
      if (rw.unit) unitByKpi[rw.kpiKey] = rw.unit;
    });
    if (value.fill === 'zero') {
      for (const k of kpiArr) for (let i = 0; i < buckets.length; i++) if (byKpi[k][i] == null) byKpi[k][i] = 0;
    }
    return ok(res, { categories: buckets, series: kpiArr.map(k => ({ name: k, key: k, data: byKpi[k] })), meta: { bucket: value.bucket, agg: value.agg, unitByKpi } });
  }

  // long
  const longRows = [];
  for (const b of buckets) {
    for (const k of kpiArr) {
      const found = rows.find(r => r.bucket === b && r.kpiKey === k);
      longRows.push({ ts: b, kpiKey: k, value: found?.value ?? (value.fill === 'zero' ? 0 : null), unit: found?.unit ?? null });
    }
  }
  return ok(res, { rows: longRows, meta: { bucket: value.bucket, agg: value.agg } });
});

export default r;
