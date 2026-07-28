import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Search, Check } from 'lucide-react'
import { TIMEZONES } from '../../utils/timezone'

export default function TimezoneDropdown({ value, onChange, label }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef(null)

  const current = TIMEZONES.find((t) => t.value === value)

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const filtered = TIMEZONES.filter((t) =>
    t.label.toLowerCase().includes(search.toLowerCase())
  )

  const handleSelect = (tz) => {
    onChange(tz.value)
    setOpen(false)
    setSearch('')
  }

  return (
    <div className="tz-dropdown" ref={ref}>
      {label && <label className="field-label">{label}</label>}
      <button className="tz-trigger" onClick={() => setOpen(!open)}>
        <span>{current ? current.label : 'Select timezone'}</span>
        <ChevronDown size={16} />
      </button>
      {open && (
        <div className="tz-dropdown-menu">
          <div className="tz-search">
            <Search size={14} />
            <input
              type="text"
              placeholder="Search timezone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>
          <div className="tz-list-scroll">
            {filtered.length === 0 ? (
              <div className="tz-empty">No timezone found</div>
            ) : (
              filtered.map((tz) => (
                <button
                  key={tz.value}
                  className={'tz-option' + (tz.value === value ? ' active' : '')}
                  onClick={() => handleSelect(tz)}
                >
                  <span className="tz-check">
                    {tz.value === value && <Check size={14} />}
                  </span>
                  <span>{tz.label}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}