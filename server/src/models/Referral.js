import mongoose from 'mongoose'

const referralSchema = new mongoose.Schema({
  candidateName: String,
  email: String, // Candidate email
  position: String, // Job position
  referrerName: String,
  referrerEmail: String,
  notes: { type: String, default: '' },
  source: { type: String, default: 'internal' }, // 'internal' or 'employee_referral'
  status: { type: String, default: 'Pending', enum: ['Pending', 'Under Review', 'Approved', 'Rejected'] },
  analysis_mode: { type: String, default: 'ai' }, // 'ai' or 'manual'
  createdAt: { type: Date, default: Date.now }
})

export default mongoose.models.Referral || mongoose.model('Referral', referralSchema)
