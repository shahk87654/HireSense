import mongoose from 'mongoose'

export const connectDB = async () => {
  const uri = process.env.MONGO_URI
  if (!uri) {
    console.warn('MONGO_URI not set — continuing without DB (in-memory fallback)')
    return
  }
  await mongoose.connect(uri, {})
  console.log('MongoDB connected')
}
