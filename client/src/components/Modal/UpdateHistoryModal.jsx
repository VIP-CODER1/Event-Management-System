import { X, Clock } from 'lucide-react'
import useEventStore from '../../store/eventStore'
import { formatInTimezone } from '../../utils/timezone'

export default function UpdateHistoryModal() {
  const { showHistoryModal, historyEvent, viewTimezone, closeHistoryModal } = useEventStore()

  if (!showHistoryModal || !historyEvent) return null

  const logs = historyEvent.updateLogs || []

  const fieldLabel = (f) => {
    const map = {
      profiles: 'Profiles',
      timezone: 'Timezone',
      startDateTime: 'Start Date/Time',
      endDateTime: 'End Date/Time'
    }
    return map[f] || f
  }

  const formatVal = (field, val) => {
    if (!val) return 'N/A'
    if (field === 'startDateTime' || field === 'endDateTime' || field === 'timestamp') {
      return formatInTimezone(val, viewTimezone)
    }
    if (field === 'profiles' && Array.isArray(val)) {
      return val.map((p) => typeof p === 'string' ? p : (p.name || p)).join(', ')
    }
    return String(val)
  }

  return (
    <div className="modal-overlay" onClick={closeHistoryModal}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Event Update History</h3>
          <button className="modal-close" onClick={closeHistoryModal}>
            <X size={18} />
          </button>
        </div>
        <div className="modal-body">
          {logs.length === 0 ? (
            <div className="modal-empty">No update history yet</div>
          ) : (
            <div className="log-list">
              {[...logs].reverse().map((log, idx) => (
                <div key={idx} className="log-entry">
                  <div className="log-timestamp">
                    <Clock size={13} />
                    {formatInTimezone(log.timestamp, viewTimezone)}
                  </div>
                  {log.changes.map((ch, ci) => (
                    <div key={ci} className="log-change">
                      <span className="log-field">{fieldLabel(ch.field)}:</span>
                      <span className="log-old">{formatVal(ch.field, ch.oldValue)}</span>
                      <span className="log-arrow">&rarr;</span>
                      <span className="log-new">{formatVal(ch.field, ch.newValue)}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
