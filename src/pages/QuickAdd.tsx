import { useState } from 'react'

const API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:3000`;

export default function QuickAdd() {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [dob, setDob] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phoneNumber: phone, dateOfBirth: dob }),
      })
      if (response.ok) {
        alert('Member added successfully!')
        setName('')
        setPhone('')
        setDob('')
      } else {
        alert('Failed to add member')
      }
    } catch (error) {
      console.error('Error adding member:', error)
      alert('Error adding member')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="card" style={{ maxWidth: '500px', margin: '0 auto' }}>
      <h1>Quick Add Member</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left' }}>
          <label htmlFor="name" style={{ fontWeight: 500, color: 'var(--primary-color)' }}>Full Name</label>
          <input
            id="name"
            type="text"
            placeholder="e.g. John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left' }}>
          <label htmlFor="phone" style={{ fontWeight: 500, color: 'var(--primary-color)' }}>Phone Number</label>
          <input
            id="phone"
            type="tel"
            placeholder="e.g. 555-123-4567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left' }}>
          <label htmlFor="dob" style={{ fontWeight: 500, color: 'var(--primary-color)' }}>Date of Birth</label>
          <input
            id="dob"
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            required
          />
        </div>

        <button type="submit" disabled={isLoading} style={{ marginTop: '1rem' }}>
          {isLoading ? 'Adding...' : 'Add Member'}
        </button>
      </form>
    </div>
  )
}