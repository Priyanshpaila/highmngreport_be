import mongoose, { Schema } from 'mongoose';

const DataEntrySchema = new Schema(
  {
    divisionId: { type: Schema.Types.ObjectId, ref: 'Division', required: true, index: true },
    submittedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    definitionKey: { type: String, required: true, index: true },
    definitionVersion: { type: Number, required: true },
    payload: { type: Schema.Types.Mixed, default: {} },
    status: { type: String, enum: ['submitted','approved','rejected'], default: 'submitted' }
  },
  { timestamps: true }
);

DataEntrySchema.index({ definitionKey: 1, definitionVersion: 1 });

export default mongoose.model('DataEntry', DataEntrySchema);
