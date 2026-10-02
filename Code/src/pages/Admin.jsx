import { useMemo } from 'react'
import { Package, FileText, TrendingUp, Users, Timer } from 'lucide-react'
import { useApp } from '../hooks/useApp'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import StatCard from '../components/StatCard'
import { PageHeader, VerifiedBadge } from '../components/ui'
import { ITEM_CATEGORIES, CLAIM_STATUS } from '../utils/constants'

const countBy = (arr, fn) => arr.reduce((m, x) => { const k = fn(x); m[k] = (m[k] || 0) + 1; return m }, {})

function Bars({ data, max }) {
  const m = max || Math.max(1, ...data.map((d) => d[1]))
  return data.map(([label, n]) => (
    <div className="bar-row" key={label}><span>{label}</span><div className="bar-track"><div className="bar-fill" style={{ width: `${(n / m) * 100}%` }} /></div><b>{n}</b></div>
  ))
}

export default function Admin() {
  const { items, claims } = useApp()
  const { users, updateUser, currentUser } = useAuth()
  const { showToast } = useToast()

  const s = useMemo(() => {
    const recovered = claims.filter((c) => c.status === CLAIM_STATUS.RECOVERED)
    const days = recovered.map((c) => {
      const it = items.find((i) => i.id === c.itemId)
      const end = c.history.find((h) => h.status === CLAIM_STATUS.RECOVERED)?.at
      return it && end ? (new Date(end) - new Date(it.createdAt)) / 864e5 : null
    }).filter((d) => d !== null)
    const trend = Array.from({ length: 14 }, (_, i) => {
      const d = new Date(Date.now() - (13 - i) * 864e5).toISOString().slice(0, 10)
      return { d, lost: items.filter((x) => x.type === 'Lost' && x.date === d).length, found: items.filter((x) => x.type === 'Found' && x.date === d).length }
    })
    return {
      lost: items.filter((i) => i.type === 'Lost').length,
      found: items.filter((i) => i.type === 'Found').length,
      returned: items.filter((i) => i.status === 'Handed Over').length,
      open: claims.filter((c) => ['Pending', 'In Review'].includes(c.status)).length,
      rate: claims.length ? Math.round((recovered.length / claims.length) * 100) : 0,
      avg: days.length ? (days.reduce((a, b) => a + b, 0) / days.length).toFixed(1) : '—',
      cats: ITEM_CATEGORIES.map((c) => [c, items.filter((i) => i.category === c).length]).filter((x) => x[1]).sort((a, b) => b[1] - a[1]),
      spots: Object.entries(countBy(items, (i) => i.location)).sort((a, b) => b[1] - a[1]).slice(0, 5),
      claimStatus: Object.entries(countBy(claims, (c) => c.status)),
      trend, tmax: Math.max(1, ...trend.map((t) => t.lost + t.found)),
    }
  }, [items, claims])

  const toggle = (u) => { updateUser(u.id, { verified: !u.verified }); showToast(`${u.name} ${u.verified ? 'unverified' : 'verified'}.`, 'success') }

  return (
    <div className="page">
      <PageHeader title="Analytics" subtitle="Campus-wide lost & found performance." />
      <div className="stat-grid">
        <StatCard label="Total reports" value={items.length} icon="▣" tone="neutral" />
        <StatCard label="Returned items" value={s.returned} icon="✓" tone="success" />
        <StatCard label="Open claims" value={s.open} icon="✎" tone="brand" />
        <StatCard label="Recovery rate" value={`${s.rate}%`} icon="⏱" tone="success" />
      </div>
      <div className="insight-grid insight-grid--3">
        <section className="panel"><h2 className="panel__title"><Timer size={14} /> Avg. time to return</h2><p className="big">{s.avg}<small> days</small></p><p>From report to verified handover.</p></section>
        <section className="panel"><h2 className="panel__title"><Package size={14} /> Lost vs found</h2><Bars data={[['Lost', s.lost], ['Found', s.found]]} /></section>
        <section className="panel"><h2 className="panel__title"><Users size={14} /> Verified users</h2><p className="big">{users.filter((u) => u.verified).length}<small> / {users.length}</small></p><p>Verified members can file claims.</p></section>
      </div>

      <section className="panel">
        <h2 className="panel__title"><TrendingUp size={14} /> Reports — last 14 days</h2>
        <div className="trend" role="img" aria-label="Reports per day">
          {s.trend.map((t) => (
            <div key={t.d} className="trend__col" title={`${t.d}: ${t.lost} lost, ${t.found} found`}>
              <div className="trend__stack" style={{ height: `${((t.lost + t.found) / s.tmax) * 100}%` }}>
                <i className="trend__found" style={{ flex: t.found }} /><i className="trend__lost" style={{ flex: t.lost }} />
              </div>
              <span>{t.d.slice(8)}</span>
            </div>
          ))}
        </div>
        <p className="legend"><i className="trend__lost" /> Lost <i className="trend__found" /> Found</p>
      </section>

      <div className="insight-grid">
        <section className="panel"><h2 className="panel__title">By category</h2><Bars data={s.cats} /></section>
        <section className="panel"><h2 className="panel__title">Hotspot locations</h2><Bars data={s.spots} /></section>
        <section className="panel"><h2 className="panel__title"><FileText size={14} /> Claims by status</h2><Bars data={s.claimStatus} /></section>
      </div>

      <section className="panel">
        <h2 className="panel__title">Members &amp; verification</h2>
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th /></tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td data-label="Name"><strong>{u.name}</strong></td><td data-label="Email">{u.email}</td><td data-label="Role" style={{ textTransform: 'capitalize' }}>{u.role}</td>
                  <td data-label="Status">{u.verified ? <VerifiedBadge user={u} label /> : <span className="muted">Unverified</span>}</td>
                  <td>{u.id !== currentUser.id && <button className="btn btn--ghost btn--sm" onClick={() => toggle(u)}>{u.verified ? 'Revoke' : 'Verify'}</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
