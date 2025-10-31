import Referral from '../models/Referral.js'

export const addReferral = async (req, res) => {
  try {
    const referral = new Referral({
      ...req.body,
      analysis_mode: process.env.AI_MODE === 'false' ? 'manual' : 'ai'
    })
    await referral.save()
    res.json(referral)
  } catch (err) {
    // Demo fallback
    res.json({
      id: Date.now(),
      candidateName: req.body.name,
      status: 'Pending',
      createdAt: new Date(),
      analysis_mode: 'manual'
    })
  }
}

// Public referral endpoint for employees (no authentication required)
export const addReferralPublic = async (req, res) => {
  try {
    const { name, email, position, referrerName, referrerEmail, notes } = req.body

    // Validate required fields
    if (!name || !email || !position || !referrerName || !referrerEmail) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, email, position, referrerName, referrerEmail'
      })
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email) || !emailRegex.test(referrerEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      })
    }

    const referral = new Referral({
      candidateName: name,
      email: email,
      position: position,
      referrerName: referrerName,
      referrerEmail: referrerEmail,
      notes: notes || '',
      status: 'Pending',
      source: 'employee_referral',
      analysis_mode: process.env.AI_MODE === 'false' ? 'manual' : 'ai',
      createdAt: new Date()
    })

    await referral.save()

    res.json({
      success: true,
      message: 'Referral submitted successfully',
      referral: {
        id: referral._id,
        candidateName: referral.candidateName,
        position: referral.position,
        status: referral.status,
        createdAt: referral.createdAt
      }
    })
  } catch (err) {
    console.error('addReferralPublic error:', err)
    res.status(500).json({
      success: false,
      message: 'Failed to submit referral. Please try again.'
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

export const updateReferralStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!['Pending', 'Approved', 'Rejected', 'Under Review'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' })
    }

    const referral = await Referral.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    )

    if (!referral) {
      return res.status(404).json({ success: false, message: 'Referral not found' })
    }

    res.json({ success: true, referral })
  } catch (err) {
    console.error('updateReferralStatus error:', err)
    res.status(500).json({ success: false, message: 'Failed to update referral status' })
  }
}

export const deleteReferral = async (req, res) => {
  try {
    const { id } = req.params
    const referral = await Referral.findByIdAndDelete(id)

    if (!referral) {
      return res.status(404).json({ success: false, message: 'Referral not found' })
    }

    res.json({ success: true, message: 'Referral deleted successfully' })
  } catch (err) {
    console.error('deleteReferral error:', err)
    res.status(500).json({ success: false, message: 'Failed to delete referral' })
  }
}
