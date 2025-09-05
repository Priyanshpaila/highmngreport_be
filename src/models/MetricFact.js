import mongoose, { Schema } from 'mongoose';

const MetricFactSchema = new Schema(
  {
    divisionId: { type: Schema.Types.ObjectId, ref: 'Division', index: true, required: true },
    ts: { type: Date, index: true, required: true },          // ISO UTC
    kpiKey: { type: String, index: true, required: true },
    value: { type: Number, default: null },
    unit: { type: String, default: null },
    tags: { type: [String], default: [] },                    // "shift:A","machine:M01"
    meta: { type: Schema.Types.Mixed, default: {} },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

MetricFactSchema.index({ divisionId: 1, kpiKey: 1, ts: 1 });
MetricFactSchema.index({ kpiKey: 1, ts: 1 });

export default mongoose.model('MetricFact', MetricFactSchema);
