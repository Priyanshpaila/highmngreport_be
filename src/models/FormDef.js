import mongoose, { Schema } from 'mongoose';

const FormDefSchema = new Schema(
  {
    key: { type: String, index: true, required: true }, // "DIVISION_ENTRY"
    version: { type: Number, required: true },
    schema: { type: Schema.Types.Mixed, required: true },  // JSON Schema
    uiSchema: { type: Schema.Types.Mixed, default: {} },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

FormDefSchema.index({ key: 1, version: 1 }, { unique: true });

export default mongoose.model('FormDef', FormDefSchema);
