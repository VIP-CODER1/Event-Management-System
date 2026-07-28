import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Search, Plus } from 'lucide-react'
import useProfileStore from '../../store/profileStore'

export default function ProfileDropdown() {
  const { profiles, currentProfile, setCurrentProfile, createProfile } = useProfileStore()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [newName, setNewName] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
        setShowAdd(false)
        setSearch('')
        setNewName('')
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const filtered = profiles.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleAdd = async () => {
    const trimmed = newName.trim()
    if (!trimmed || trimmed.length < 2) return
    try {
      const profile = await createProfile(trimmed, 'America/New_York')
      setCurrentProfile(profile)
      setNewName('')
      setShowAdd(false)
      setSearch('')
    } catch (e) {
      alert(e.message)
    }
  }

  const displayLabel = currentProfile ? currentProfile.name : 'Select current profile...'

  return (
    <div className="profile-dropdown" ref={ref}>
      <button className="profile-trigger" onClick={() => setOpen(!open)}>
        <span>{displayLabel}</span>
        <ChevronDown size={16} />
      </button>
      {open && (
        <div className="dropdown-menu">
          <div className="dropdown-search">
            <Search size={14} />
            <input
              type="text"
              placeholder="Search current profile..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>

          <div className="dropdown-list">
            {filtered.length === 0 && !showAdd && (
              <div className="dropdown-empty">No profile found.</div>
            )}
            {filtered.map((p) => (
              <button
                key={p._id}
                className={'dropdown-item' + (p._id === currentProfile?._id ? ' active' : '')}
                onClick={() => { setCurrentProfile(p); setOpen(false); setSearch('') }}
              >
                {p.name}
              </button>
            ))}
          </div>

          <div className="dropdown-footer">
            <button className="btn-add-profile" onClick={() => setShowAdd(!showAdd)}>
              <Plus size={14} />
              <span>Add Profile</span>
            </button>
          </div>

          {showAdd && (
            <div className="add-profile-form">
              <input
                type="text"
                placeholder="Enter profile name..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                autoFocus
              />
              <button className="btn-confirm-add" onClick={handleAdd} disabled={newName.trim().length < 2}>
                Add
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}