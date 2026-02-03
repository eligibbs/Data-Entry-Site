import { Routes, Route, Link } from 'react-router-dom'
import QuickAdd from './pages/QuickAdd'
import Profile from './pages/Profile'
import './App.css'

function App() {
  return (
    <div className="app-container">
      <nav>
        <Link to="/">Quick Add</Link> | <Link to="/profile">Profile</Link>
      </nav>
      <Routes>
        <Route path="/" element={<QuickAdd />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </div>
  )
}

export default App