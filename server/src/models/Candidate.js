import mongoose from 'mongoose'

const candidateSchema = new mongoose.Schema({
  name: String,
  email: String,
  skills: [String],
  experience_summary: String,
  education: String,
  fit_score: Number,
  reason: String,
  job_title: String,
  location: String,
  gender: String,
  createdAt: { type: Date, default: Date.now }
})

export default mongoose.models.Candidate || mongoose.model('Candidate', candidateSchema)
