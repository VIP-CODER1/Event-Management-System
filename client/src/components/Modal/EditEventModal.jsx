import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import useEventStore from '../../store/eventStore'
import useProfileStore from '../../store/profileStore'
import ProfileSelector from '../CreateEvent/ProfileSelector'
import TimezoneDropdown from '../CreateEvent/TimezoneDropdown'
import DateTimePicker from '../CreateEvent/DateTimePicker'

dayjs.extend(utc)
dayjs.extend(timezone)

export default function EditEventModal() {
  const {
    editingEvent, selectedProfileIds, formTimezone, startDateTime, endDateTime,
    setFormField, updateEvent, resetForm, fetchEvents, showToast
  } = useEventStore()
  const { profiles } = useProfileStore()

  const [localStart, setLocalStart] = useState('')
  const [localStartTime, setLocalStartTime] = useState('09:00')
  const [localEnd, setLocalEnd] = useState('')
  const [localEndTime, setLocalEndTime] = useState('09:00')

  useEffect(() => {
    if (editingEvent && startDateTime && formTimezone) {
      const sLocal = dayjs.utc(startDateTime).tz(formTimezone)
      const eLocal = dayjs.utc(endDateTime).tz(formTimezone)
      setLocalStart(sLocal.format('YYYY-MM-DD'))
      setLocalStartTime(sLocal.format('HH:mm'))
      setLocalEnd(eLocal.format('YYYY-MM-DD'))
      setLocalEndTime(eLocal.format('HH:mm'))
    }
  }, [editingEvent, startDateTime, endDateTime, formTimezone])

  if (!editingEvent) return null

  const toUTC = (date, time, tz) => {
    if (!date) return ''
    const combined = dayjs.tz(date + ' ' + (time || '09:00'), tz)
    return combined.utc().toISOString()
  }

  const handleUpdate = async () => {
    if (selectedProfileIds.length === 0) {
      alert('Please select at least one profile')
      return
    }
    if (!localStart || !localEnd) {
      alert('Please pick start and end dates')
      return
    }

    const sISO = toUTC(localStart, localStartTime, formTimezone)
    const eISO = toUTC(localEnd, localEndTime, formTimezone)

    if (new Date(eISO) < new Date(sISO)) {
      alert('End date/time must be after start date/time')
      return
    }

    try {
      await updateEvent(editingEvent._id, {
        profiles: selectedProfileIds,
        timezone: formTimezone,
        startDateTime: sISO,
        endDateTime: eISO
      })
      resetForm()
      fetchEvents()
      showToast('Event updated successfully!')
    } catch (err) {
      alert(err.message)
    }
  }

  const handleClose = () => {
    resetForm()
  }

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content edit-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Edit Event</h3>
          <button className="modal-close" onClick={handleClose}>
            <X size={18} />
          </button>
        </div>
        <div className="modal-body">
          <ProfileSelector
            selectedIds={selectedProfileIds}
            onChange={(ids) => setFormField('selectedProfileIds', ids)}
          />

          <TimezoneDropdown
            label="Timezone"
            value={formTimezone}
            onChange={(tz) => setFormField('formTimezone', tz)}
          />

          <DateTimePicker
            label="Start Date & Time"
            dateValue={localStart}
            timeValue={localStartTime}
            onDateChange={setLocalStart}
            onTimeChange={setLocalStartTime}
          />

          <DateTimePicker
            label="End Date & Time"
            dateValue={localEnd}
            timeValue={localEndTime}
            onDateChange={setLocalEnd}
            onTimeChange={setLocalEndTime}
          />
        </div>
        <div className="modal-footer">
          <button className="btn-cancel-edit" onClick={handleClose}>Cancel</button>
          <button className="btn-create" onClick={handleUpdate}>Update Event</button>
        </div>
      </div>
    </div>
  )
}