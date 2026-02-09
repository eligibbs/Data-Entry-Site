import { useState, useEffect } from 'react'

const API_BASE_URL = '';

export default function Register() {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [dob, setDob] = useState('')
  const [county, setCounty] = useState('')
  const [inService, setInService] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isEnabled, setIsEnabled] = useState(false)
  const [checkingStatus, setCheckingStatus] = useState(true)
  const [companyName, setCompanyName] = useState('')
  const [subsidiaryName, setSubsidiaryName] = useState('')
  const [counties, setCounties] = useState<string[]>([])

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/config/self-registration`)
      .then(res => res.json())
      .then(data => {
        setIsEnabled(data.enabled)
        setCheckingStatus(false)
      })
      .catch(() => setCheckingStatus(false))

    fetch(`${API_BASE_URL}/api/config/company-name`)
      .then(res => res.json())
      .then(data => {
        setCompanyName(data.companyName)
        setSubsidiaryName(data.subsidiaryName)
        setCounties(data.counties || [])
      })
      .catch(console.error)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/register-member`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phoneNumber: phone, dateOfBirth: dob, county, inService }),
      })
      if (response.ok) {
        alert('Registration successful!')
        setName('')
        setPhone('')
        setDob('')
        setCounty('')
        setInService(false)
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

  const displayCompanyName = subsidiaryName || companyName

  return (
    <div className="card" style={{ maxWidth: '500px', margin: '2rem auto' }}>
      <h1>Member Registration{displayCompanyName ? ` | ${displayCompanyName}` : ''}</h1>
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left' }}>
          <label htmlFor="county" style={{ fontWeight: 500, color: 'var(--primary-color)' }}>County of Residence</label>
          {counties.length > 0 ? (
            <select
              id="county"
              value={county}
              onChange={(e) => setCounty(e.target.value)}
            >
              <option value="">Select County</option>
              {counties.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          ) : (
            <input
              id="county"
              type="text"
              placeholder="e.g. Orange County"
              value={county}
              onChange={(e) => setCounty(e.target.value)}
            />
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textAlign: 'left' }}>
          <input
            id="inService"
            type="checkbox"
            checked={inService}
            onChange={(e) => setInService(e.target.checked)}
          />
          <label htmlFor="inService" style={{ fontWeight: 500, color: 'var(--primary-color)' }}>Already in service from {companyName || 'company'}?</label>
        </div>

        <button type="submit" disabled={isLoading} style={{ marginTop: '1rem' }}>
          {isLoading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  )
}