const STOP = new Set(['the', 'and', 'with', 'for', 'near', 'has', 'was', 'from', 'one'])
const tok = (s = '') => s.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w))
const overlap = (a, b) => {
  const A = new Set(a), B = new Set(b)
  if (!A.size || !B.size) return 0
  let n = 0
  A.forEach((x) => B.has(x) && n++)
  return n / Math.min(A.size, B.size)
}
const text = (i) => `${i.description || ''} ${i.color || ''} ${i.identifyingMarks || ''}`

// Returns 0-100 similarity between a Lost and a Found report, with human-readable reasons.
export function scoreMatch(a, b) {
  let score = 0
  const reasons = []
  if (a.category === b.category) { score += 30; reasons.push('Same category') }
  const nm = overlap(tok(`${a.name} ${a.brand || ''}`), tok(`${b.name} ${b.brand || ''}`))
  if (nm > 0) { score += Math.round(nm * 25); reasons.push('Similar name / brand') }
  const ds = overlap(tok(text(a)), tok(text(b)))
  if (ds > 0) { score += Math.round(ds * 15); reasons.push('Matching details') }
  const lc = overlap(tok(a.location), tok(b.location))
  if (lc > 0) { score += Math.round(lc * 20); reasons.push('Same area') }
  const days = Math.abs(new Date(a.date) - new Date(b.date)) / 864e5
  if (days <= 3) { score += 10; reasons.push('Close in time') } else if (days <= 7) score += 6
  else if (days <= 14) score += 3
  return { score: Math.min(100, score), reasons }
}

// All plausible counterparts (opposite type, still open) for an item, best first.
export function findMatches(item, all, min = 40) {
  return all
    .filter((o) => o.id !== item.id && o.type !== item.type && o.status !== 'Handed Over')
    .map((o) => {
      const lost = item.type === 'Lost' ? item : o
      const found = item.type === 'Lost' ? o : item
      return { item: o, ...scoreMatch(lost, found) }
    })
    .filter((m) => m.score >= min)
    .sort((x, y) => y.score - x.score)
}
