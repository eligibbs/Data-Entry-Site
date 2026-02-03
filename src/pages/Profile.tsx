import { useState, useEffect } from 'react'

interface Member {
  id: number
  name: string
  phoneNumber: string
  dateOfBirth: string
  attendances: Attendance[]
}

interface Attendance {
  id: number
  date: string
  activity: string
  memberId: number
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function Profile() {
  const [members, setMembers] = useState<Member[]>([])
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null)
  const [attendanceDate, setAttendanceDate] = useState('')
  const [activity, setActivity] = useState('Wednesday Circle')
  
  // Edit state
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editDob, setEditDob] = useState('')

  useEffect(() => {
    fetchMembers()
  }, [])

  useEffect(() => {
    if (selectedMemberId) {
      const member = members.find(m => m.id === selectedMemberId)
      if (member) {
        setEditName(member.name)
        setEditPhone(member.phoneNumber)
        setEditDob(member.dateOfBirth)
        setIsEditing(false)
      }
    }
  }, [selectedMemberId, members])

  const fetchMembers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/members`)
      const data = await response.json()
      setMembers(data)
    } catch (error) {
      console.error('Error fetching members:', error)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMemberId) return

    try {
      const response = await fetch(`${API_BASE_URL}/api/members/${selectedMemberId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName,
          phoneNumber: editPhone,
          dateOfBirth: editDob,
        }),
      })
      if (response.ok) {
        alert('Profile updated!')
        setIsEditing(false)
        fetchMembers()
      } else {
        alert('Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
    }
  }

  const handleDeleteMember = async () => {
    if (!selectedMemberId) return
    if (!confirm('Are you sure you want to delete this member? This action cannot be undone.')) return

    try {
      const response = await fetch(`${API_BASE_URL}/api/members/${selectedMemberId}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        alert('Member deleted!')
        setSelectedMemberId(null)
        fetchMembers()
      } else {
        alert('Failed to delete member')
      }
    } catch (error) {
      console.error('Error deleting member:', error)
    }
  }

  const handleAddAttendance = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMemberId) return

    try {
      const response = await fetch(`${API_BASE_URL}/api/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: selectedMemberId,
          date: attendanceDate,
          activity,
        }),
      })
      if (response.ok) {
        alert('Attendance added!')
        fetchMembers() // Refresh data
      } else {
        alert('Failed to add attendance')
      }
    } catch (error) {
      console.error('Error adding attendance:', error)
    }
  }

  const handleDeleteAttendance = async (attendanceId: number) => {
    if (!confirm('Are you sure you want to delete this attendance record?')) return

    try {
      const response = await fetch(`${API_BASE_URL}/api/attendance/${attendanceId}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        fetchMembers()
      } else {
        alert('Failed to delete attendance')
      }
    } catch (error) {
      console.error('Error deleting attendance:', error)
    }
  }

  const selectedMember = members.find((m) => m.id === selectedMemberId)

  return (
    <div style={{ width: '100%', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>Member Profiles</h1>
      
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'center' }}>
        <select 
          onChange={(e) => setSelectedMemberId(Number(e.target.value))}
          value={selectedMemberId || ''}
          style={{ width: '100%', maxWidth: '400px', padding: '0.8rem' }}
        >
          <option value="">Select a Member</option>
          {members.map((member) => (
            <option key={member.id} value={member.id}>
              {member.name}
            </option>
          ))}
        </select>
      </div>

      {selectedMember && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Profile Details</h2>
              <button 
                className="secondary"
                onClick={() => setIsEditing(!isEditing)} 
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}
              >
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
            </div>
            
            {isEditing ? (
              <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left' }}>
                  <label style={{ fontWeight: 500, color: 'var(--primary-color)' }}>Name</label>
                  <input type="text" value={editName} onChange={e => setEditName(e.target.value)} required />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left' }}>
                  <label style={{ fontWeight: 500, color: 'var(--primary-color)' }}>Phone</label>
                  <input type="tel" value={editPhone} onChange={e => setEditPhone(e.target.value)} required />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left' }}>
                  <label style={{ fontWeight: 500, color: 'var(--primary-color)' }}>DOB</label>
                  <input type="date" value={editDob} onChange={e => setEditDob(e.target.value)} required />
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button type="submit" style={{ flex: 1 }}>Save Changes</button>
                  <button type="button" className="danger" onClick={handleDeleteMember} style={{ flex: 1 }}>
                    Delete Member
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <span style={{ display: 'block', fontSize: '0.85rem', color: '#666' }}>Name</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 500 }}>{selectedMember.name}</span>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.85rem', color: '#666' }}>Phone</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 500 }}>{selectedMember.phoneNumber}</span>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.85rem', color: '#666' }}>Date of Birth</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 500 }}>{selectedMember.dateOfBirth}</span>
                </div>
              </div>
            )}
          </div>

          <div className="card">
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Add Attendance</h2>
            <form onSubmit={handleAddAttendance} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              <input
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                required
              />
              <select value={activity} onChange={(e) => setActivity(e.target.value)}>
                <option value="Wednesday Circle">Wednesday Circle</option>
                <option value="Thursday Circle">Thursday Circle</option>
              </select>
              <button type="submit">Record Attendance</button>
            </form>
            
            <h3 style={{ textAlign: 'left', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>History</h3>
            <ul style={{ 
              maxHeight: '250px', 
              overflowY: 'auto', 
              padding: 0, 
              listStyle: 'none', 
              textAlign: 'left' 
            }}>
              {selectedMember.attendances?.length === 0 && (
                <li style={{ color: '#888', fontStyle: 'italic', padding: '0.5rem 0' }}>No attendance records found.</li>
              )}
              {selectedMember.attendances?.slice().reverse().map((att) => (
                <li key={att.id} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '0.75rem 0',
                  borderBottom: '1px solid #f0f0f0'
                }}>
                  <span>
                    <strong>{att.date}</strong> - {att.activity}
                  </span>
                  <button 
                    className="danger"
                    onClick={() => handleDeleteAttendance(att.id)}
                    style={{ 
                      padding: '0.2rem 0.6rem', 
                      fontSize: '0.8rem',
                      marginLeft: '1rem'
                    }}
                    title="Delete Record"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}