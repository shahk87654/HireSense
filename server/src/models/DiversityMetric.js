import mongoose from 'mongoose'

const diversitySchema = new mongoose.Schema({
  genderDistribution: { type: mongoose.Schema.Types.Mixed, default: {} },
  educationDistribution: { type: mongoose.Schema.Types.Mixed, default: {} },
  locationDistribution: { type: mongoose.Schema.Types.Mixed, default: {} },
  diversityIndex: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
})

export default mongoose.models.DiversityMetric || mongoose.model('DiversityMetric', diversitySchema)
