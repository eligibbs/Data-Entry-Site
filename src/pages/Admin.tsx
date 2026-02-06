import { useState, useEffect } from 'react'

interface User {
  id: number
  email: string
  role: string
  active: boolean
}

const API_BASE_URL = '';

export default function Admin() {
  const [users, setUsers] = useState<User[]>([])
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newRole, setNewRole] = useState('user')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/users`)
      if (res.ok) {
        setUsers(await res.json())
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch(`${API_BASE_URL}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newEmail, password: newPassword, role: newRole })
      })
      if (res.ok) {
        setNewEmail('')
        setNewPassword('')
        fetchUsers()
      } else {
        alert('Failed to create user')
      }
    } catch (error) {
      console.error('Error creating user:', error)
    }
  }

  const handleUpdateUser = async (id: number, updates: Partial<User>) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      if (res.ok) fetchUsers()
    } catch (error) {
      console.error('Error updating user:', error)
    }
  }

  const handleDeleteUser = async (id: number) => {
    if (!confirm('Delete this user?')) return
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/${id}`, { method: 'DELETE' })
      if (res.ok) fetchUsers()
    } catch (error) {
      console.error('Error deleting user:', error)
    }
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1>User Management</h1>
      
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2>Create New User</h2>
        <form onSubmit={handleCreateUser} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <label>Email/Username</label>
            <input value={newEmail} onChange={e => setNewEmail(e.target.value)} required />
          </div>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <label>Password</label>
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
          </div>
          <div style={{ width: '100px', textAlign: 'left' }}>
            <label>Role</label>
            <select value={newRole} onChange={e => setNewRole(e.target.value)}>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button type="submit">Create</button>
        </form>
      </div>

      <div className="card">
        <h2>Existing Users</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #ccc' }}>
              <th style={{ textAlign: 'left', padding: '0.5rem' }}>Email</th>
              <th style={{ textAlign: 'left', padding: '0.5rem' }}>Role</th>
              <th style={{ textAlign: 'left', padding: '0.5rem' }}>Status</th>
              <th style={{ textAlign: 'right', padding: '0.5rem' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '0.5rem', textAlign: 'left' }}>{user.email}</td>
                <td style={{ padding: '0.5rem', textAlign: 'left' }}>
                  <select 
                    value={user.role} 
                    onChange={e => handleUpdateUser(user.id, { role: e.target.value })}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td style={{ padding: '0.5rem', textAlign: 'left' }}>
                  <button 
                    className={user.active ? '' : 'secondary'}
                    onClick={() => handleUpdateUser(user.id, { active: !user.active })}
                    style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem' }}
                  >
                    {user.active ? 'Active' : 'Disabled'}
                  </button>
                </td>
                <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                  <button 
                    className="danger" 
                    onClick={() => handleDeleteUser(user.id)}
                    style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem' }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}