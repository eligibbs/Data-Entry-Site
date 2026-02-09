import express from 'express'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const app = express()
const port = 3000

app.use(cors())
app.use(express.json())

// Initialize default admin user and config
async function init() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin'
  const adminPassword = process.env.ADMIN_PASSWORD || 'password'

  try {
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    })

    if (!existingAdmin) {
      await prisma.user.create({
        data: {
          email: adminEmail,
          password: adminPassword, // In a real app, hash this!
          role: 'admin'
        }
      })
      console.log('Default admin user created')
    }

    // Initialize self-registration config if not exists
    const selfRegConfig = await prisma.systemConfig.findUnique({
      where: { key: 'selfRegistrationEnabled' }
    })
    if (!selfRegConfig) {
      await prisma.systemConfig.create({
        data: { key: 'selfRegistrationEnabled', value: 'false' }
      })
    }
  } catch (error) {
    console.error('Error initializing system:', error)
  }
}

init()

// Helper to normalize date strings to YYYY-MM-DD
const normalizeDate = (d: string) => {
  if (!d) return ''
  const trimmed = d.trim()
  // If already YYYY-MM-DD, return it to avoid timezone shifts
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed
  
  const date = new Date(trimmed)
  if (isNaN(date.getTime())) return trimmed
  return date.toISOString().split('T')[0]
}

// Helper to check for duplicate members
async function findDuplicateMember(name: string, dateOfBirth: string) {
  const inputDob = normalizeDate(dateOfBirth)
  const normalizedInputName = name.trim().toLowerCase().replace(/\s+/g, ' ')

  // Fetch potential matches by DOB (normalized or raw) OR Name (exact)
  const potentialMatches = await prisma.member.findMany({
    where: {
      OR: [
        { dateOfBirth: inputDob },
        { dateOfBirth: dateOfBirth.trim() },
        { name: name.trim() }
      ]
    }
  })

  return potentialMatches.find(m => {
    const dbName = m.name.trim().toLowerCase().replace(/\s+/g, ' ')
    const dbDob = normalizeDate(m.dateOfBirth)
    return dbName === normalizedInputName && dbDob === inputDob
  })
}

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body
  try {
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user || user.password !== password || !user.active) {
      return res.status(401).json({ error: 'Invalid credentials or account inactive' })
    }

    // In a real app, return a JWT token here
    res.json({ 
      id: user.id, 
      email: user.email, 
      role: user.role 
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Login failed' })
  }
})

// Middleware to check auth (simplified for this example)
// In a real app, verify JWT token here
const requireAuth = (req: any, res: any, next: any) => {
  // For this simple implementation, we'll rely on the frontend to send a header
  // or just assume if they can hit the API they are logged in (not secure for production!)
  // A better approach is to use a session or token passed in headers.
  // For now, we will skip actual verification to keep it simple as requested,
  // but normally you'd check req.headers.authorization
  next()
}

// Public endpoint for self-registration
app.post('/api/register-member', async (req, res) => {
  try {
    const config = await prisma.systemConfig.findUnique({
      where: { key: 'selfRegistrationEnabled' }
    })
    
    if (!config || config.value !== 'true') {
      return res.status(403).json({ error: 'Self-registration is currently disabled' })
    }

    const { name, phoneNumber, dateOfBirth, county, inService } = req.body

    const duplicate = await findDuplicateMember(name, dateOfBirth)
    if (duplicate) {
      return res.status(409).json({ 
        error: 'You are already registered! If you need to update your information, let us know.' 
      })
    }

    const member = await prisma.member.create({
      data: {
        name: name.trim(),
        phoneNumber,
        dateOfBirth: normalizeDate(dateOfBirth),
        county,
        inService
      },
    })
    res.json(member)
  } catch (error) {
    console.error('Error registering member:', error)
    res.status(500).json({ error: 'Error registering member' })
  }
})

// Get system config (publicly readable to check if registration is open)
app.get('/api/config/self-registration', async (req, res) => {
  try {
    const config = await prisma.systemConfig.findUnique({
      where: { key: 'selfRegistrationEnabled' }
    })
    res.json({ enabled: config?.value === 'true' })
  } catch (error) {
    res.status(500).json({ error: 'Error fetching config' })
  }
})

// Update system config (Admin only)
app.put('/api/config/self-registration', requireAuth, async (req, res) => {
  const { enabled } = req.body
  try {
    const config = await prisma.systemConfig.upsert({
      where: { key: 'selfRegistrationEnabled' },
      update: { value: String(enabled) },
      create: { key: 'selfRegistrationEnabled', value: String(enabled) }
    })
    res.json({ enabled: config.value === 'true' })
  } catch (error) {
    res.status(500).json({ error: 'Error updating config' })
  }
})

// Get all members with attendance
app.get('/api/members', requireAuth, async (req, res) => {
  try {
    const members = await prisma.member.findMany({
      include: { attendances: true },
    })
    res.json(members)
  } catch (error) {
    console.error('Error fetching members:', error)
    res.status(500).json({ error: 'Error fetching members' })
  }
})

// Create a new member (Quick Add)
app.post('/api/members', requireAuth, async (req, res) => {
  const { name, phoneNumber, dateOfBirth, county, inService } = req.body
  try {
    const duplicate = await findDuplicateMember(name, dateOfBirth)
    if (duplicate) {
      return res.status(409).json({ 
        error: 'You are already registered! If you need to update your information, let us know.'
      })
    }

    const member = await prisma.member.create({
      data: {
        name: name.trim(),
        phoneNumber,
        dateOfBirth: normalizeDate(dateOfBirth),
        county,
        inService
      },
    })
    res.json(member)
  } catch (error) {
    console.error('Error creating member:', error)
    res.status(500).json({ error: 'Error creating member' })
  }
})

// Update a member
app.put('/api/members/:id', requireAuth, async (req, res) => {
  const { id } = req.params
  const { name, phoneNumber, dateOfBirth, county, inService } = req.body
  try {
    // Note: We might want to check for duplicates here too, but excluding the current ID.
    // For now, keeping it simple as requested.
    const member = await prisma.member.update({
      where: { id: Number(id) },
      data: {
        name,
        phoneNumber,
        dateOfBirth: dateOfBirth ? normalizeDate(dateOfBirth) : undefined,
        county,
        inService
      },
    })
    res.json(member)
  } catch (error) {
    console.error('Error updating member:', error)
    res.status(500).json({ error: 'Error updating member' })
  }
})

// Delete a member
app.delete('/api/members/:id', requireAuth, async (req, res) => {
  const { id } = req.params
  try {
    await prisma.member.delete({
      where: { id: Number(id) },
    })
    res.json({ message: 'Member deleted' })
  } catch (error) {
    console.error('Error deleting member:', error)
    res.status(500).json({ error: 'Error deleting member' })
  }
})

// Add attendance
app.post('/api/attendance', requireAuth, async (req, res) => {
  const { memberId, date, activity } = req.body
  try {
    const attendance = await prisma.attendance.create({
      data: {
        memberId,
        date,
        activity,
      },
    })
    res.json(attendance)
  } catch (error) {
    console.error('Error adding attendance:', error)
    res.status(500).json({ error: 'Error adding attendance' })
  }
})

// Delete attendance
app.delete('/api/attendance/:id', requireAuth, async (req, res) => {
  const { id } = req.params
  try {
    await prisma.attendance.delete({
      where: { id: Number(id) },
    })
    res.json({ message: 'Attendance deleted' })
  } catch (error) {
    console.error('Error deleting attendance:', error)
    res.status(500).json({ error: 'Error deleting attendance' })
  }
})

// User Management Routes (Admin only)

// Get all users
app.get('/api/users', requireAuth, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, role: true, active: true }
    })
    res.json(users)
  } catch (error) {
    res.status(500).json({ error: 'Error fetching users' })
  }
})

// Create user
app.post('/api/users', requireAuth, async (req, res) => {
  const { email, password, role } = req.body
  try {
    const user = await prisma.user.create({
      data: { email, password, role }
    })
    res.json({ id: user.id, email: user.email, role: user.role, active: user.active })
  } catch (error) {
    res.status(500).json({ error: 'Error creating user' })
  }
})

// Update user (promote/demote/disable)
app.put('/api/users/:id', requireAuth, async (req, res) => {
  const { id } = req.params
  const { role, active, password } = req.body
  
  const data: any = {}
  if (role !== undefined) data.role = role
  if (active !== undefined) data.active = active
  if (password !== undefined) data.password = password

  try {
    const user = await prisma.user.update({
      where: { id: Number(id) },
      data
    })
    res.json({ id: user.id, email: user.email, role: user.role, active: user.active })
  } catch (error) {
    res.status(500).json({ error: 'Error updating user' })
  }
})

// Delete user
app.delete('/api/users/:id', requireAuth, async (req, res) => {
  const { id } = req.params
  try {
    await prisma.user.delete({ where: { id: Number(id) } })
    res.json({ message: 'User deleted' })
  } catch (error) {
    res.status(500).json({ error: 'Error deleting user' })
  }
})

// Get company name and counties
app.get('/api/config/company-name', async (req, res) => {
  try {
    const companyName = process.env.COMPANY_NAME || ''
    const subsidiaryName = process.env.SUBSIDIARY_NAME || ''
    const counties = (process.env.COUNTIES || '').split(',').map(c => c.trim()).filter(c => c)
    const activities = (process.env.ACTIVITIES || '').split(',').map(c => c.trim()).filter(c => c)
    res.json({ companyName, subsidiaryName, counties, activities })
  } catch (error) {
    res.status(500).json({ error: 'Error fetching company name' })
  }
})

// Reports Endpoints

// 1. Member list (with demographics)
// Already covered by GET /api/members, but we might want a specific one for reports if needed.
// For now, we can reuse GET /api/members on the frontend.

// 2. Attendance Report (by date and activity)
app.get('/api/reports/attendance', requireAuth, async (req, res) => {
  const { date, activity } = req.query
  if (!date || !activity) {
    return res.status(400).json({ error: 'Date and activity are required' })
  }

  try {
    const attendances = await prisma.attendance.findMany({
      where: {
        date: String(date),
        activity: String(activity)
      },
      include: {
        member: true
      }
    })
    res.json(attendances)
  } catch (error) {
    console.error('Error fetching attendance report:', error)
    res.status(500).json({ error: 'Error fetching attendance report' })
  }
})

// 3. Members per County
app.get('/api/reports/county-stats', requireAuth, async (req, res) => {
  try {
    const members = await prisma.member.findMany()
    const stats: Record<string, number> = {}
    
    // Initialize with configured counties if we want to show 0s, 
    // but for now let's just count what's in the DB.
    // Actually, user asked for a dropdown of counties, so maybe they want to filter by county?
    // "Number of members per County" usually means a summary.
    
    members.forEach(m => {
      const c = m.county || 'Unknown'
      stats[c] = (stats[c] || 0) + 1
    })
    
    // Convert to array for easier frontend handling
    const result = Object.entries(stats).map(([county, count]) => ({ county, count }))
    res.json(result)
  } catch (error) {
    console.error('Error fetching county stats:', error)
    res.status(500).json({ error: 'Error fetching county stats' })
  }
})

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${port}`)
})