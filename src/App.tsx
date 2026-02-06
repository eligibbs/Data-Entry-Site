import { Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import QuickAdd from './pages/QuickAdd'
import Profile from './pages/Profile'
import Login from './pages/Login'
import Admin from './pages/Admin'
import Register from './pages/Register'
import './App.css'

function App() {
  const [user, setUser] = useState<any>(null)
  const navigate = useNavigate()

  useEffect(() => {
    // Check for stored user session on load (simplified)
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  const handleLogin = (userData: any) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('user')
    navigate('/login')
  }

  // Public routes wrapper
  if (!user) {
    return (
      <div className="app-container">
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    )
  }

  return (
    <div className="app-container">
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 1rem' }}>
        <div>
          <Link to="/">Quick Add</Link> | <Link to="/profile">Profile</Link>
          {user.role === 'admin' && <> | <Link to="/admin">Admin</Link></>}
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.9rem' }}>{user.email}</span>
          <button onClick={handleLogout} className="secondary" style={{ padding: '0.2rem 0.6rem', fontSize: '0.8rem' }}>Logout</button>
        </div>
      </nav>
      <Routes>
        <Route path="/" element={<QuickAdd />} />
        <Route path="/profile" element={<Profile />} />
        {user.role === 'admin' && <Route path="/admin" element={<Admin />} />}
        {/* Allow logged-in users to see the register page too if they want, or redirect */}
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App