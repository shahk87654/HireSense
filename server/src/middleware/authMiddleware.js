import jwt from 'jsonwebtoken'

export const protect = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) throw new Error('No token')
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret')
    req.user = decoded
    next()
  } catch (err) {
    res.status(401).json({ message: 'Unauthorized' })
  }
}