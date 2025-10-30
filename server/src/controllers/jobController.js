import JobDescription from '../models/JobDescription.js'

// GET /api/jobs
export const getJobDescriptions = async (req, res) => {
  try {
    const jobs = await JobDescription.find({ status: 'active' })
      .sort({ createdAt: -1 })
    res.json({ success: true, jobs })
  } catch (err) {
    console.error('getJobDescriptions error:', err)
    res.status(500).json({ success: false, message: 'Failed to fetch job descriptions' })
  }
}

// POST /api/jobs
export const createJobDescription = async (req, res) => {
  try {
    const { title, description, department, requirements } = req.body
    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Title and description are required' })
    }

    const job = new JobDescription({
      title,
      description,
      department,
      requirements: requirements || [],
      createdBy: req.user._id
    })

    await job.save()
    res.json({ success: true, job })
  } catch (err) {
    console.error('createJobDescription error:', err)
    res.status(500).json({ success: false, message: 'Failed to create job description' })
  }
}

// PUT /api/jobs/:id
export const updateJobDescription = async (req, res) => {
  try {
    const { id } = req.params
    const { title, description, department, requirements, status } = req.body
    
    const job = await JobDescription.findById(id)
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job description not found' })
    }

    job.title = title || job.title
    job.description = description || job.description
    job.department = department || job.department
    job.requirements = requirements || job.requirements
    job.status = status || job.status

    await job.save()
    res.json({ success: true, job })
  } catch (err) {
    console.error('updateJobDescription error:', err)
    res.status(500).json({ success: false, message: 'Failed to update job description' })
  }
}

// GET /api/jobs/:id
export const getJobDescription = async (req, res) => {
  try {
    const { id } = req.params
    const job = await JobDescription.findById(id)
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job description not found' })
    }
    res.json({ success: true, job })
  } catch (err) {
    console.error('getJobDescription error:', err)
    res.status(500).json({ success: false, message: 'Failed to fetch job description' })
  }
}

// DELETE /api/jobs/:id
export const deleteJobDescription = async (req, res) => {
  try {
    const { id } = req.params
    await JobDescription.findByIdAndDelete(id)
    res.json({ success: true, message: 'Job description deleted' })
  } catch (err) {
    console.error('deleteJobDescription error:', err)
    res.status(500).json({ success: false, message: 'Failed to delete job description' })
  }
}