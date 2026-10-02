import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, X } from 'lucide-react'
import { useApp } from '../hooks/useApp'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import ItemCard from '../components/ItemCard'
import SearchBar from '../components/SearchBar'
import Modal from '../components/Modal'
import EmptyState from '../components/EmptyState'
import { PageHeader } from '../components/ui'
import { ITEM_CATEGORIES, ITEM_TYPES, ITEM_STATUSES } from '../utils/constants'

const SORTS = { newest: 'Newest first', oldest: 'Oldest first', value: 'Highest value' }
const PERIODS = { all: 'Any time', 7: 'Last 7 days', 30: 'Last 30 days', custom: 'Specific date…' }
const init = { q: '', type: 'all', category: 'all', status: 'all', period: 'all', day: '', sort: 'newest', mine: false }

export default function Items() {
  const { items, deleteItem } = useApp()
  const { currentUser } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [f, setF] = useState(init)
  const [target, setTarget] = useState(null)
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }))
  const canManage = (i) => i.userId === currentUser.id || currentUser.role === 'admin'

  const filtered = useMemo(() => {
    const words = f.q.toLowerCase().split(/\s+/).filter(Boolean)
    const cutoff = f.period === 'all' || f.period === 'custom' ? 0 : Date.now() - Number(f.period) * 864e5
    return items
      .filter((i) => {
        const hay = `${i.name} ${i.description || ''} ${i.location} ${i.category} ${i.brand || ''} ${i.color || ''}`.toLowerCase()
        return words.every((w) => hay.includes(w)) &&
          (f.type === 'all' || i.type === f.type) &&
          (f.category === 'all' || i.category === f.category) &&
          (f.status === 'all' || i.status === f.status) &&
          (!f.mine || i.userId === currentUser.id) &&
          (f.period !== 'custom' || !f.day || i.date === f.day) &&
          new Date(i.date).getTime() >= cutoff
      })
      .sort((a, b) => f.sort === 'value' ? (b.value || 0) - (a.value || 0) : f.sort === 'oldest' ? new Date(a.date) - new Date(b.date) : new Date(b.date) - new Date(a.date))
  }, [items, f, currentUser.id])

  const chips = [
    f.type !== 'all' && ['type', f.type], f.category !== 'all' && ['category', f.category], f.status !== 'all' && ['status', f.status],
    f.period !== 'all' && ['period', f.period === 'custom' ? (f.day || 'Pick a date') : PERIODS[f.period]], f.mine && ['mine', 'My reports'],
  ].filter(Boolean)
  const reset = (k) => setF((p) => ({ ...p, [k]: k === 'mine' ? false : 'all', ...(k === 'period' ? { day: '' } : {}) }))
  const Sel = ({ k, label, opts }) => (
    <label className="fld"><span>{label}</span>
      <select value={f[k]} onChange={(e) => set(k, e.target.value)}>
        {Array.isArray(opts) ? [<option key="all" value="all">All</option>, ...opts.map((o) => <option key={o}>{o}</option>)]
          : Object.entries(opts).map(([v, t]) => <option key={v} value={v}>{t}</option>)}
      </select>
    </label>
  )

  return (
    <div className="page">
      <PageHeader title="Lost & Found" subtitle="Search every report across campus.">
        <Link to="/report" className="btn btn--primary"><Plus size={16} /> Report Item</Link>
      </PageHeader>

      <section className="filters">
        <SearchBar value={f.q} onChange={(v) => set('q', v)} placeholder="Search by name, brand, colour, location…" />
        <div className="filters__grid">
          <Sel k="type" label="Type" opts={ITEM_TYPES} />
          <Sel k="category" label="Category" opts={ITEM_CATEGORIES} />
          <Sel k="status" label="Status" opts={ITEM_STATUSES} />
          <Sel k="period" label="Date" opts={PERIODS} />
          {f.period === 'custom' && <label className="fld"><span>Pick date</span><input type="date" value={f.day} max={new Date().toISOString().slice(0, 10)} onChange={(e) => set('day', e.target.value)} /></label>}
          <Sel k="sort" label="Sort by" opts={SORTS} />
          <label className="check"><input type="checkbox" checked={f.mine} onChange={(e) => set('mine', e.target.checked)} /> My reports only</label>
        </div>
        <div className="filters__foot">
          <span>{filtered.length} result{filtered.length === 1 ? '' : 's'}</span>
          {chips.map(([k, label]) => <button key={k} className="chip" onClick={() => reset(k)}>{label} <X size={12} /></button>)}
          {(chips.length > 0 || f.q) && <button className="link-btn" onClick={() => setF(init)}>Clear all</button>}
        </div>
      </section>

      {filtered.length === 0 ? (
        <EmptyState icon="⌕" title="No reports match" message="Try different keywords or clear some filters." />
      ) : (
        <div className="card-grid">
          {filtered.map((i) => <ItemCard key={i.id} item={i} onEdit={canManage(i) ? () => navigate(`/report/${i.id}`) : undefined} onDelete={canManage(i) ? setTarget : undefined} />)}
        </div>
      )}

      <Modal isOpen={!!target} onClose={() => setTarget(null)} title="Delete report"
        footer={<><button className="btn btn--ghost" onClick={() => setTarget(null)}>Cancel</button>
          <button className="btn btn--danger" onClick={() => { deleteItem(target.id); showToast('Report deleted.', 'success'); setTarget(null) }}>Delete</button></>}>
        <p>Delete <strong>{target?.name}</strong> and all claims filed against it? This cannot be undone.</p>
      </Modal>
    </div>
  )
}
