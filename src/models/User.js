import mongoose, { Schema } from 'mongoose';

const UserSchema = new Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['superadmin', 'admin', 'user'], default: 'user' },
    isActive: { type: Boolean, default: true },
    screenAccess: [{ type: Schema.Types.ObjectId, ref: 'Screen' }]
  },
  { timestamps: true }
);

export default mongoose.model('User', UserSchema);
