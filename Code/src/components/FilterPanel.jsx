export default function FilterPanel({ filters, onChange }) {
  return (
    <div className="filter-panel" role="group" aria-label="Filters">
      {filters.map((filter) => (
        <div className="filter-panel__group" key={filter.name}>
          <label htmlFor={`filter-${filter.name}`}>{filter.label}</label>
          <select
            id={`filter-${filter.name}`}
            value={filter.value}
            onChange={(e) => onChange(filter.name, e.target.value)}
          >
            <option value="all">All {filter.label}</option>
            {filter.options.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      ))}
    </div>
  )
}
