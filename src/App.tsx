import { Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import QuickAdd from './pages/QuickAdd'
import Profile from './pages/Profile'
import Login from './pages/Login'
import Admin from './pages/Admin'
import Register from './pages/Register'
import Reports from './pages/Reports'
import './App.css'

const API_BASE_URL = '';

function App() {
  const [user, setUser] = useState<any>(null)
  const [companyName, setCompanyName] = useState('')
  const [subsidiaryName, setSubsidiaryName] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    // Check for stored user session on load (simplified)
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }

    fetch(`${API_BASE_URL}/api/config/company-name`)
      .then(res => res.json())
      .then(data => {
        setCompanyName(data.companyName)
        setSubsidiaryName(data.subsidiaryName)
      })
      .catch(console.error)
  }, [])

  const currentYear = new Date().getFullYear()
  const displayTitle = subsidiaryName || companyName || 'Data Entry Site'
  const copyrightName = companyName || 'Data Entry Site'

  useEffect(() => {
    document.title = `Data Entry | ${displayTitle}`
  }, [displayTitle])

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
        <header style={{ textAlign: 'center', padding: '1rem 0' }}>
          <h2>{displayTitle}</h2>
        </header>
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        <footer style={{ textAlign: 'center', padding: '2rem 0', fontSize: '0.8rem', color: '#666' }}>
          {copyrightName} &copy; {currentYear}
        </footer>
      </div>
    )
  }

  return (
    <div className="app-container">
      <header style={{ textAlign: 'center', padding: '1rem 0' }}>
        <h2>{displayTitle}</h2>
      </header>
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 1rem' }}>
        <div>
          <Link to="/">Quick Add</Link> | <Link to="/profile">Profile</Link> | <Link to="/reports">Reports</Link>
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
        <Route path="/reports" element={<Reports />} />
        {user.role === 'admin' && <Route path="/admin" element={<Admin />} />}
        {/* Allow logged-in users to see the register page too if they want, or redirect */}
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <footer style={{ textAlign: 'center', padding: '2rem 0', fontSize: '0.8rem', color: '#666' }}>
        {copyrightName} &copy; {currentYear}
      </footer>
    </div>
  )
}

export default App