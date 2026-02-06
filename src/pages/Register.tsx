import { useState, useEffect } from 'react'

const API_BASE_URL = '';

export default function Register() {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [dob, setDob] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isEnabled, setIsEnabled] = useState(false)
  const [checkingStatus, setCheckingStatus] = useState(true)

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/config/self-registration`)
      .then(res => res.json())
      .then(data => {
        setIsEnabled(data.enabled)
        setCheckingStatus(false)
      })
      .catch(() => setCheckingStatus(false))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/register-member`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phoneNumber: phone, dateOfBirth: dob }),
      })
      if (response.ok) {
        alert('Registration successful!')
        setName('')
        setPhone('')
        setDob('')
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to register')
      }
    } catch (error) {
      console.error('Error registering:', error)
      alert('Error registering')
    } finally {
      setIsLoading(false)
    }
  }

  if (checkingStatus) return <div>Loading...</div>

  if (!isEnabled) {
    return (
      <div className="card" style={{ maxWidth: '500px', margin: '2rem auto', textAlign: 'center' }}>
        <h2>Registration Closed</h2>
        <p>Self-registration isn't open right now.</p>
      </div>
    )
  }

  return (
    <div className="card" style={{ maxWidth: '500px', margin: '2rem auto' }}>
      <h1>Member Registration</h1>
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
          {isLoading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  )
}