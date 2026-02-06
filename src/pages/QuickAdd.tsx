import { useState, useEffect } from 'react'

const API_BASE_URL = '';

export default function QuickAdd() {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [dob, setDob] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selfRegEnabled, setSelfRegEnabled] = useState(false)

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/config/self-registration`)
      .then(res => res.json())
      .then(data => setSelfRegEnabled(data.enabled))
      .catch(console.error)
  }, [])

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
        const data = await response.json()
        alert(data.error || 'Failed to add member')
      }
    } catch (error) {
      console.error('Error adding member:', error)
      alert('Error adding member')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleSelfReg = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/config/self-registration`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !selfRegEnabled })
      })
      if (res.ok) {
        const data = await res.json()
        setSelfRegEnabled(data.enabled)
      }
    } catch (error) {
      console.error('Error toggling self-registration:', error)
    }
  }

  return (
    <div className="card" style={{ maxWidth: '500px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1 style={{ margin: 0 }}>Quick Add Member</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
          <label htmlFor="selfRegToggle" style={{ cursor: 'pointer' }}>Self-Reg:</label>
          <button 
            id="selfRegToggle"
            onClick={toggleSelfReg}
            className={selfRegEnabled ? '' : 'secondary'}
            style={{ padding: '0.2rem 0.6rem', fontSize: '0.8rem' }}
          >
            {selfRegEnabled ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

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