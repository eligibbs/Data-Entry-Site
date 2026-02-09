import { useState, useEffect } from 'react'

const API_BASE_URL = '';

interface Member {
  id: number
  name: string
  phoneNumber: string
  dateOfBirth: string
  county?: string
  inService?: boolean
}

interface AttendanceRecord {
  id: number
  date: string
  activity: string
  member: Member
}

interface CountyStat {
  county: string
  count: number
}

export default function Reports() {
  const [activeTab, setActiveTab] = useState<'members' | 'attendance' | 'county'>('members')
  const [members, setMembers] = useState<Member[]>([])
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [countyStats, setCountyStats] = useState<CountyStat[]>([])
  const [counties, setCounties] = useState<string[]>([])
  const [activities, setActivities] = useState<string[]>([])

  // Attendance filter state
  const [attendanceDate, setAttendanceDate] = useState('')
  const [attendanceActivity, setAttendanceActivity] = useState('')

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/config/company-name`)
      .then(res => res.json())
      .then(data => {
        setCounties(data.counties || [])
        const fetchedActivities = data.activities || []
        setActivities(fetchedActivities)
        if (fetchedActivities.length > 0) {
          setAttendanceActivity(fetchedActivities[0])
        } else {
          setAttendanceActivity('Default Activity')
        }
      })
      .catch(console.error)
  }, [])

  useEffect(() => {
    if (activeTab === 'members') {
      fetchMembers()
    } else if (activeTab === 'county') {
      fetchCountyStats()
    }
  }, [activeTab])

  const fetchMembers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/members`)
      const data = await res.json()
      setMembers(data)
    } catch (error) {
      console.error('Error fetching members:', error)
    }
  }

  const fetchAttendanceReport = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!attendanceDate || !attendanceActivity) return

    try {
      const res = await fetch(`${API_BASE_URL}/api/reports/attendance?date=${attendanceDate}&activity=${attendanceActivity}`)
      const data = await res.json()
      setAttendanceRecords(data)
    } catch (error) {
      console.error('Error fetching attendance report:', error)
    }
  }

  const fetchCountyStats = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/reports/county-stats`)
      const data = await res.json()
      setCountyStats(data)
    } catch (error) {
      console.error('Error fetching county stats:', error)
    }
  }

  const exportToCSV = (data: any[], filename: string) => {
    if (!data.length) return

    // Get headers from first object
    const headers = Object.keys(data[0])
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(fieldName => {
        const val = row[fieldName]
        return typeof val === 'string' ? `"${val}"` : val
      }).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', filename)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleExportMembers = () => {
    const data = members.map(m => ({
      ID: m.id,
      Name: m.name,
      Phone: m.phoneNumber,
      DOB: m.dateOfBirth,
      County: m.county || '',
      InService: m.inService ? 'Yes' : 'No'
    }))
    exportToCSV(data, 'members_report.csv')
  }

  const handleExportAttendance = () => {
    const data = attendanceRecords.map(r => ({
      Date: r.date,
      Activity: r.activity,
      MemberName: r.member.name,
      MemberPhone: r.member.phoneNumber
    }))
    exportToCSV(data, `attendance_${attendanceDate}_${attendanceActivity}.csv`)
  }

  const handleExportCountyStats = () => {
    exportToCSV(countyStats, 'county_stats.csv')
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <h1>Reports</h1>
      
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid #ddd' }}>
        <button 
          className={activeTab === 'members' ? '' : 'secondary'}
          onClick={() => setActiveTab('members')}
          style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0, marginBottom: -1 }}
        >
          Member List
        </button>
        <button 
          className={activeTab === 'attendance' ? '' : 'secondary'}
          onClick={() => setActiveTab('attendance')}
          style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0, marginBottom: -1 }}
        >
          Attendance
        </button>
        <button 
          className={activeTab === 'county' ? '' : 'secondary'}
          onClick={() => setActiveTab('county')}
          style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0, marginBottom: -1 }}
        >
          County Stats
        </button>
      </div>

      {activeTab === 'members' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2>Member List</h2>
            <button onClick={handleExportMembers}>Export CSV</button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #eee' }}>
                  <th style={{ padding: '0.5rem' }}>Name</th>
                  <th style={{ padding: '0.5rem' }}>Phone</th>
                  <th style={{ padding: '0.5rem' }}>DOB</th>
                  <th style={{ padding: '0.5rem' }}>County</th>
                  <th style={{ padding: '0.5rem' }}>In Service</th>
                </tr>
              </thead>
              <tbody>
                {members.map(m => (
                  <tr key={m.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '0.5rem' }}>{m.name}</td>
                    <td style={{ padding: '0.5rem' }}>{m.phoneNumber}</td>
                    <td style={{ padding: '0.5rem' }}>{m.dateOfBirth}</td>
                    <td style={{ padding: '0.5rem' }}>{m.county || '-'}</td>
                    <td style={{ padding: '0.5rem' }}>{m.inService ? 'Yes' : 'No'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'attendance' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2>Attendance Report</h2>
            {attendanceRecords.length > 0 && (
              <button onClick={handleExportAttendance}>Export CSV</button>
            )}
          </div>
          
          <form onSubmit={fetchAttendanceReport} style={{ display: 'flex', gap: '1rem', alignItems: 'end', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left' }}>
              <label>Date</label>
              <input 
                type="date" 
                value={attendanceDate} 
                onChange={e => setAttendanceDate(e.target.value)} 
                required 
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left' }}>
              <label>Activity</label>
              <select value={attendanceActivity} onChange={e => setAttendanceActivity(e.target.value)}>
                {activities.length > 0 ? (
                  activities.map(a => (
                    <option key={a} value={a}>{a}</option>
                  ))
                ) : (
                  <>
                    <option value="Wednesday Circle">Wednesday Circle</option>
                    <option value="Thursday Circle">Thursday Circle</option>
                  </>
                )}
              </select>
            </div>
            <button type="submit">Generate</button>
          </form>

          {attendanceRecords.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #eee' }}>
                    <th style={{ padding: '0.5rem' }}>Member Name</th>
                    <th style={{ padding: '0.5rem' }}>Phone</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceRecords.map(r => (
                    <tr key={r.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '0.5rem' }}>{r.member.name}</td>
                      <td style={{ padding: '0.5rem' }}>{r.member.phoneNumber}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p style={{ marginTop: '1rem', textAlign: 'right' }}>Total: {attendanceRecords.length}</p>
            </div>
          ) : (
            <p style={{ fontStyle: 'italic', color: '#666' }}>No records found or no filter applied.</p>
          )}
        </div>
      )}

      {activeTab === 'county' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2>Members per County</h2>
            <button onClick={handleExportCountyStats}>Export CSV</button>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #eee' }}>
                  <th style={{ padding: '0.5rem' }}>County</th>
                  <th style={{ padding: '0.5rem' }}>Count</th>
                </tr>
              </thead>
              <tbody>
                {countyStats.map(stat => (
                  <tr key={stat.county} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '0.5rem' }}>{stat.county}</td>
                    <td style={{ padding: '0.5rem' }}>{stat.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}