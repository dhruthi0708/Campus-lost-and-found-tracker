import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { useApp } from '../hooks/useApp'
import { useAuth } from '../hooks/useAuth'
import EmptyState from '../components/EmptyState'
import { PageHeader, ScoreBar } from '../components/ui'
import { findMatches } from '../utils/match'

export default function Matches() {
  const { items, myItems } = useApp()
  const { currentUser } = useAuth()
  const source = currentUser.role === 'admin' ? items.filter((i) => i.type === 'Lost') : myItems
  const groups = useMemo(() => source
    .filter((i) => i.status !== 'Handed Over')
    .map((i) => ({ item: i, matches: findMatches(i, items).slice(0, 3) }))
    .filter((g) => g.matches.length)
    .sort((a, b) => b.matches[0].score - a.matches[0].score), [source, items])

  return (
    <div className="page">
      <PageHeader title="Smart Match" subtitle="Reports ranked by category, name, location, details and timing." />
      {groups.length === 0 ? (
        <EmptyState icon="✦" title="No matches yet" message="When a similar lost or found report appears, it will show up here." />
      ) : (
        <div className="stack">
          {groups.map(({ item, matches }) => (
            <section className="panel" key={item.id}>
              <div className="match-head">
                <span className={`item-card__type item-card__type--inline ${item.type === 'Lost' ? 'item-card__type--lost' : 'item-card__type--found'}`}>{item.type}</span>
                <Link to={`/items/${item.id}`}><strong>{item.name}</strong></Link>
                <span className="muted">{item.location}</span>
              </div>
              <div className="stack stack--sm">
                {matches.map((m) => (
                  <Link key={m.item.id} to={`/items/${m.item.id}`} className="match-row">
                    <div><strong><Sparkles size={13} /> {m.item.name}</strong><span>{m.item.type} · {m.item.location}</span>
                      <span className="reasons">{m.reasons.join(' · ')}</span></div>
                    <ScoreBar score={m.score} />
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
