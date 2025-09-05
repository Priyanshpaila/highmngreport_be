import mongoose, { Schema } from 'mongoose';

const DivisionSchema = new Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true, index: true },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model('Division', DivisionSchema);
