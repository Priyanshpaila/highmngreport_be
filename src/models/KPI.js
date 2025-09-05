import mongoose, { Schema } from 'mongoose';

const KPISchema = new Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    label: { type: String, required: true },
    unit: { type: String, default: null },
    decimals: { type: Number, default: 0 },
    category: { type: String, default: 'General' },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model('KPI', KPISchema);
