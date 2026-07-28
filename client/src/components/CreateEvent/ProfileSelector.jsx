import { useState } from 'react'
import { Check, Plus, Search } from 'lucide-react'
import useProfileStore from '../../store/profileStore'

export default function ProfileSelector({ selectedIds, onChange }) {
  const { profiles, createProfile } = useProfileStore()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [newName, setNewName] = useState('')

  const filtered = profiles.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  const toggleProfile = (id) => {
    const next = selectedIds.includes(id)
      ? selectedIds.filter((x) => x !== id)
      : [...selectedIds, id]
    onChange(next)
  }

  const handleAdd = async () => {
    const trimmed = newName.trim()
    if (!trimmed || trimmed.length < 2) return
    try {
      const profile = await createProfile(trimmed, 'America/New_York')
      onChange([...selectedIds, profile._id])
      setNewName('')
      setSearch('')
    } catch (e) {
      alert(e.message)
    }
  }

  return (
    <div className="profile-selector">
      <label className="field-label">Profiles</label>
      <div className="multi-select-trigger" onClick={() => setOpen(!open)}>
        {selectedIds.length === 0 ? (
          <span className="placeholder">Select profiles...</span>
        ) : (
          <span className="selected-count">{selectedIds.length} selected</span>
        )}
      </div>
      {open && (
        <div className="multi-select-dropdown">
          <div className="search-box">
            <Search size={14} />
            <input
              type="text"
              placeholder="Search current profile..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="profile-list">
            {filtered.map((p) => (
              <label key={p._id} className="profile-option">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(p._id)}
                  onChange={() => toggleProfile(p._id)}
                />
                <span>{p.name}</span>
                {selectedIds.includes(p._id) && <Check size={14} className="check-icon" />}
              </label>
            ))}
          </div>
          <div className="add-profile-row">
            <input
              type="text"
              placeholder="Add new profile..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
            <button className="btn-add" onClick={handleAdd} disabled={newName.trim().length < 2}>
              <Plus size={14} /> Add
            </button>
          </div>
        </div>
      )}
    </div>
  )
}