import { Calendar, Users, Edit3, FileText } from 'lucide-react'
import { formatInTimezone } from '../../utils/timezone'

export default function EventCard({ event, viewTimezone, onEdit, onViewLogs }) {
  const profileNames = (event.profiles || []).map((p) => {
    if (typeof p === 'string') return p
    return p.name
  }).join(', ')

  return (
    <div className="event-card">
      <div className="event-card-body">
        <div className="event-profiles">
          <Users size={14} />
          <span>{profileNames || 'No profiles'}</span>
        </div>

        <div className="event-time-row">
          <Calendar size={14} />
          <span className="event-time-label">Start:</span>
          <span>{formatInTimezone(event.startDateTime, viewTimezone)}</span>
        </div>

        <div className="event-time-row">
          <Calendar size={14} />
          <span className="event-time-label">End:</span>
          <span>{formatInTimezone(event.endDateTime, viewTimezone)}</span>
        </div>

        <div className="event-meta">
          <span>Created: {formatInTimezone(event.createdAt, viewTimezone)}</span>
          <span>Updated: {formatInTimezone(event.updatedAt, viewTimezone)}</span>
        </div>
      </div>

      <div className="event-card-actions">
        <button className="btn-action btn-edit" onClick={() => onEdit(event)}>
          <Edit3 size={14} /> Edit
        </button>
        <button className="btn-action btn-logs" onClick={() => onViewLogs(event)}>
          <FileText size={14} /> View Logs
        </button>
      </div>
    </div>
  )
}
