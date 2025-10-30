import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import User from '../models/User.js'

// Hardcoded demo credentials
const DEMO_EMAIL = 'hr@gno.com.pk'
const DEMO_PASSWORD = 'GOPAK'

export const login = async (req, res) => {
  try {
    const { email, password } = req.body
    
    // Demo auth check
    if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
      const token = jwt.sign({ id: 'demo', email }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '24h' })
      return res.json({ token, user: { name: 'HR Admin', email } })
    }

    // Real auth (if MongoDB connected)
    const user = await User.findOne({ email })
    if (!user) throw new Error('User not found')
    
    const match = await user.comparePassword(password)
    if (!match) throw new Error('Invalid password')

    const token = jwt.sign({ id: user._id, email }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '24h' })
    res.json({ token, user: { name: user.name, email: user.email } })

  } catch (err) {
    res.status(401).json({ message: 'Invalid credentials' })
  }
}