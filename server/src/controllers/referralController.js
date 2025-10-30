import Referral from '../models/Referral.js'

export const addReferral = async (req, res) => {
  try {
    const referral = new Referral(req.body)
    await referral.save()
    res.json(referral)
  } catch (err) {
    // Demo fallback
    res.json({
      id: Date.now(),
      candidateName: req.body.name,
      status: 'Pending',
      createdAt: new Date()
    })
  }
}

export const getReferrals = async (req, res) => {
  try {
    const referrals = await Referral.find().sort('-createdAt')
    res.json(referrals)
  } catch (err) {
    // Demo data
    res.json([
      { id: 1, candidateName: 'Sarah Demo', role: 'Frontend Dev', status: 'Pending' },
      { id: 2, candidateName: 'Mike Test', role: 'Backend Dev', status: 'Reviewing' }
    ])
  }
}