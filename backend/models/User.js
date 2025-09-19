import mongoose from 'mongoose';

const GeminiResponseSchema = new mongoose.Schema({
  role: String,
  responseText: String,
  createdAt: { type: Date, default: Date.now },
});

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  geminiResponses: { type: [GeminiResponseSchema], default: [] },
});

export default mongoose.model('User', UserSchema);
