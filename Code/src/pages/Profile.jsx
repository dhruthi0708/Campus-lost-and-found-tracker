import { useState } from 'react'
import { BadgeCheck, ShieldAlert } from 'lucide-react'
import { useApp } from '../hooks/useApp'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import StatCard from '../components/StatCard'
import { PageHeader } from '../components/ui'
import { formatDate } from '../utils/helpers'

export default function Profile() {
  const { currentUser, updateProfile } = useAuth()
  const { myItems, myClaims, items } = useApp()
  const { showToast } = useToast()
  const [name, setName] = useState(currentUser.name)
  const [roll, setRoll] = useState(currentUser.rollNo || '')
  const [dept, setDept] = useState(currentUser.department || '')
  const returned = myItems.filter((i) => i.status === 'Handed Over').length

  function save(e) {
    e.preventDefault()
    if (!name.trim()) return showToast('Name is required.', 'error')
    updateProfile({ name: name.trim(), rollNo: roll.trim(), department: dept.trim() })
    showToast('Profile saved.', 'success')
  }
  function verify() {
    if (!/^[A-Za-z0-9-]{6,}$/.test(roll.trim()) || !dept.trim()) return showToast('Enter a valid roll / staff ID and department first.', 'error')
    updateProfile({ rollNo: roll.trim(), department: dept.trim(), verified: true, verifiedAt: new Date().toISOString() })
    showToast('Your account is now verified.', 'success')
  }

  return (
    <div className="page page--narrow">
      <PageHeader title="Profile" subtitle="Manage your identity and verification." />
      <div className="stat-grid">
        <StatCard label="Reports" value={myItems.length} icon="▣" tone="neutral" />
        <StatCard label="Claims" value={myClaims.length} icon="✎" tone="brand" />
        <StatCard label="Items returned" value={returned} icon="✓" tone="success" />
        <StatCard label="On campus board" value={items.length} icon="🎒" tone="neutral" />
      </div>
      <section className={`panel verify-card ${currentUser.verified ? 'verify-card--ok' : ''}`}>
        {currentUser.verified ? <BadgeCheck size={22} /> : <ShieldAlert size={22} />}
        <div>
          <h2 className="panel__title" style={{ margin: 0 }}>{currentUser.verified ? 'Verified campus member' : 'Account not verified'}</h2>
          <p>{currentUser.verified ? `Verified${currentUser.verifiedAt ? ` on ${formatDate(currentUser.verifiedAt)}` : ''}. You can file claims.` : 'Add your roll number and department to verify. Verified members can file claims and show a badge.'}</p>
        </div>
        {!currentUser.verified && <button className="btn btn--accent" onClick={verify}>Verify now</button>}
      </section>
      <section className="panel">
        <h2 className="panel__title">Details</h2>
        <form onSubmit={save} className="stack stack--sm">
          <div className="form-field"><label>Full name</label><input value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div className="form-field"><label>Email</label><input value={currentUser.email} disabled /></div>
          <div className="grid-2">
            <div className="form-field"><label>Roll / staff ID</label><input value={roll} onChange={(e) => setRoll(e.target.value)} placeholder="21CS1001" /></div>
            <div className="form-field"><label>Department</label><input value={dept} onChange={(e) => setDept(e.target.value)} placeholder="CSE" /></div>
          </div>
          <p className="muted">Role: <strong style={{ textTransform: 'capitalize' }}>{currentUser.role}</strong> · Member since {formatDate(currentUser.createdAt)}</p>
          <div><button className="btn btn--primary">Save changes</button></div>
        </form>
      </section>
    </div>
  )
}
