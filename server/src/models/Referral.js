import mongoose from 'mongoose'

const referralSchema = new mongoose.Schema({
  candidateName: String,
  candidateEmail: String,
  role: String,
  referrerName: String,
  department: String,
  status: { type: String, default: 'Pending' },
  createdAt: { type: Date, default: Date.now }
})

export default mongoose.models.Referral || mongoose.model('Referral', referralSchema)