import mongoose from 'mongoose';
import { env } from '../config/env.js';

export async function connectDB() {
  mongoose.set('strictQuery', true);
  if (!env.mongoUri) throw new Error("MONGO_URI not set");
  await mongoose.connect(env.mongoUri, { autoIndex:true});
  console.log('Mongo connected');
}
