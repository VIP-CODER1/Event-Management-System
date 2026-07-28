import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)

export const TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HT)' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
  { value: 'Europe/Berlin', label: 'Berlin (CET/CEST)' },
  { value: 'Asia/Kolkata', label: 'India (IST)' },
  { value: 'Asia/Dubai', label: 'Dubai (GST)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST)' },
  { value: 'Pacific/Auckland', label: 'Auckland (NZST)' },
  { value: 'UTC', label: 'UTC' }
]

export function formatInTimezone(date, tz) {
  return dayjs(date).tz(tz).format('MMM D, YYYY [at] h:mm A')
}

export function toUTC(dateStr, timeStr, tz) {
  const combined = `${dateStr}T${timeStr || '09:00'}:00`
  return dayjs.tz(combined, tz).utc().toISOString()
}

export function fromUTC(utcDate, tz) {
  return dayjs.utc(utcDate).tz(tz).format('YYYY-MM-DD')
}

export function timeFromUTC(utcDate, tz) {
  return dayjs.utc(utcDate).tz(tz).format('HH:mm')
}

export function getTimezoneLabel(value) {
  const found = TIMEZONES.find((t) => t.value === value)
  return found ? found.label : value
}

export function computeTimezoneAbbreviation(tz) {
  return dayjs().tz(tz).format('z')
}