import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface LoginProps {
  onLogin: (user: any) => void
}

const API_BASE_URL = '';

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      
      if (response.ok) {
        const user = await response.json()
        onLogin(user)
        navigate('/')
      } else {
        setError('Invalid credentials')
      }
    } catch (err) {
      setError('Login failed')
    }
  }

  return (
    <div className="card" style={{ maxWidth: '400px', margin: '2rem auto' }}>
      <h1>Login</h1>
      {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ textAlign: 'left' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Email/Username</label>
          <input 
            type="text" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            required 
          />
        </div>
        <div style={{ textAlign: 'left' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Password</label>
          <input 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required 
          />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  )
}