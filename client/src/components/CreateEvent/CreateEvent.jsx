import { useState } from 'react'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import useEventStore from '../../store/eventStore'
import ProfileSelector from './ProfileSelector'
import TimezoneDropdown from './TimezoneDropdown'
import DateTimePicker from './DateTimePicker'

dayjs.extend(utc)
dayjs.extend(timezone)

export default function CreateEvent() {
  const { createEvent, fetchEvents, showToast } = useEventStore()
  const [selectedProfiles, setSelectedProfiles] = useState([])
  const [tz, setTz] = useState('America/New_York')
  const [startDate, setStartDate] = useState('')
  const [startTime, setStartTime] = useState('09:00')
  const [endDate, setEndDate] = useState('')
  const [endTime, setEndTime] = useState('09:00')

  const toUTC = (date, time, timezone) => {
    if (!date) return ''
    const combined = dayjs.tz(date + ' ' + (time || '09:00'), timezone)
    return combined.utc().toISOString()
  }

  const handleSubmit = async () => {
    if (selectedProfiles.length === 0) {
      alert('Please select at least one profile')
      return
    }
    if (!startDate || !endDate) {
      alert('Please pick start and end dates')
      return
    }

    const sISO = toUTC(startDate, startTime, tz)
    const eISO = toUTC(endDate, endTime, tz)

    if (new Date(eISO) < new Date(sISO)) {
      alert('End date/time must be after start date/time')
      return
    }

    try {
      await createEvent({
        profiles: selectedProfiles,
        timezone: tz,
        startDateTime: sISO,
        endDateTime: eISO
      })
      setSelectedProfiles([])
      setTz('America/New_York')
      setStartDate('')
      setStartTime('09:00')
      setEndDate('')
      setEndTime('09:00')
      fetchEvents()
      showToast('Event created successfully!')
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <div className="panel create-event-panel">
      <h2 className="panel-title">Create Event</h2>

      <ProfileSelector
        selectedIds={selectedProfiles}
        onChange={setSelectedProfiles}
      />

      <TimezoneDropdown
        label="Timezone"
        value={tz}
        onChange={setTz}
      />

      <DateTimePicker
        label="Start Date & Time"
        dateValue={startDate}
        timeValue={startTime}
        onDateChange={setStartDate}
        onTimeChange={setStartTime}
      />

      <DateTimePicker
        label="End Date & Time"
        dateValue={endDate}
        timeValue={endTime}
        onDateChange={setEndDate}
        onTimeChange={setEndTime}
      />

      <button className="btn-create" onClick={handleSubmit}>
        + Create Event
      </button>
    </div>
  )
}