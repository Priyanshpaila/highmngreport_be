import mongoose, { Schema } from 'mongoose';

const ScreenSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    category: { type: String, default: 'General' },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model('Screen', ScreenSchema);
