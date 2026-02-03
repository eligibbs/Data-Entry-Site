import express from 'express'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const app = express()
const port = 3000

app.use(cors())
app.use(express.json())

// Get all members with attendance
app.get('/api/members', async (req, res) => {
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

// Create a new member
app.post('/api/members', async (req, res) => {
  const { name, phoneNumber, dateOfBirth } = req.body
  try {
    const member = await prisma.member.create({
      data: {
        name,
        phoneNumber,
        dateOfBirth,
      },
    })
    res.json(member)
  } catch (error) {
    console.error('Error creating member:', error)
    res.status(500).json({ error: 'Error creating member' })
  }
})

// Update a member
app.put('/api/members/:id', async (req, res) => {
  const { id } = req.params
  const { name, phoneNumber, dateOfBirth } = req.body
  try {
    const member = await prisma.member.update({
      where: { id: Number(id) },
      data: {
        name,
        phoneNumber,
        dateOfBirth,
      },
    })
    res.json(member)
  } catch (error) {
    console.error('Error updating member:', error)
    res.status(500).json({ error: 'Error updating member' })
  }
})

// Delete a member
app.delete('/api/members/:id', async (req, res) => {
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
app.post('/api/attendance', async (req, res) => {
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
app.delete('/api/attendance/:id', async (req, res) => {
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

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${port}`)
})