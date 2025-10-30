import mongoose from 'mongoose'

const cultureFitSchema = new mongoose.Schema({
  candidateName: { type: String },
  fitScore: { type: Number, default: 0 },
  explanation: { type: String },
  createdAt: { type: Date, default: Date.now }
})

export default mongoose.models.CultureFit || mongoose.model('CultureFit', cultureFitSchema)
