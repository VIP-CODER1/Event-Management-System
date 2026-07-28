import useEventStore from '../../store/eventStore'
import useProfileStore from '../../store/profileStore'
import EventCard from './EventCard'
import EmptyState from './EmptyState'
import TimezoneDropdown from '../CreateEvent/TimezoneDropdown'

export default function EventsList() {
  const { events, loading, viewTimezone, setFormField, setEditingEvent, openHistoryModal, fetchEvents } = useEventStore()
  const { currentProfile } = useProfileStore()

  const filtered = currentProfile
    ? events.filter((ev) =>
        ev.profiles.some((p) => {
          const pid = typeof p === 'string' ? p : p._id
          return pid === currentProfile._id
        })
      )
    : events

  const handleEdit = (event) => {
    setEditingEvent(event)
  }

  const handleViewLogs = (event) => {
    openHistoryModal(event)
  }

  return (
    <div className="panel events-panel">
      <h2 className="panel-title">Events</h2>

      <div className="events-toolbar">
        <TimezoneDropdown
          label="View in Timezone"
          value={viewTimezone}
          onChange={(tz) => setFormField('viewTimezone', tz)}
        />
      </div>

      <div className="events-list">
        {loading ? (
          <div className="loading-state">Loading events...</div>
        ) : filtered.length === 0 ? (
          <EmptyState />
        ) : (
          filtered.map((ev) => (
            <EventCard
              key={ev._id}
              event={ev}
              viewTimezone={viewTimezone}
              onEdit={handleEdit}
              onViewLogs={handleViewLogs}
            />
          ))
        )}
      </div>
    </div>
  )
}
