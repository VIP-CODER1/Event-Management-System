import { useState, useRef, useEffect } from 'react'
import { Calendar, Clock } from 'lucide-react'

export default function DateTimePicker({ dateValue, timeValue, onDateChange, onTimeChange, label }) {
  const [showCalendar, setShowCalendar] = useState(false)
  const calRef = useRef(null)

  const today = new Date()
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [viewYear, setViewYear] = useState(today.getFullYear())

  useEffect(() => {
    function handleClick(e) {
      if (calRef.current && !calRef.current.contains(e.target)) setShowCalendar(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December']
  const dayNames = ['Su','Mo','Tu','We','Th','Fr','Sa']

  const firstDay = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()

  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const goPrev = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1) }
    else setViewMonth(viewMonth - 1)
  }

  const goNext = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1) }
    else setViewMonth(viewMonth + 1)
  }

  const pickDate = (day) => {
    const mm = String(viewMonth + 1).padStart(2, '0')
    const dd = String(day).padStart(2, '0')
    onDateChange(viewYear + '-' + mm + '-' + dd)
    setShowCalendar(false)
  }

  const formatDate = (val) => {
    if (!val) return 'Pick a date'
    const d = new Date(val + 'T00:00:00')
    return monthNames[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear()
  }

  return (
    <div className="datetime-picker">
      <label className="field-label">{label}</label>
      <div className="datetime-row">
        <div className="date-input-wrap" ref={calRef}>
          <div className="date-input" onClick={() => setShowCalendar(!showCalendar)}>
            <Calendar size={16} className="input-icon" />
            <span>{formatDate(dateValue)}</span>
          </div>
          {showCalendar && (
            <div className="calendar-popup">
              <div className="cal-header">
                <button onClick={goPrev}>&lt;</button>
                <span>{monthNames[viewMonth]} {viewYear}</span>
                <button onClick={goNext}>&gt;</button>
              </div>
              <div className="cal-days">
                {dayNames.map((d) => <div key={d} className="cal-day-name">{d}</div>)}
              </div>
              <div className="cal-grid">
                {cells.map((day, i) => (
                  <div
                    key={i}
                    className={'cal-cell' + (day ? ' selectable' : '') + (day && dateValue === viewYear + '-' + String(viewMonth+1).padStart(2,'0') + '-' + String(day).padStart(2,'0') ? ' selected' : '')}
                    onClick={() => day && pickDate(day)}
                  >
                    {day}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="time-input-wrap">
          <Clock size={16} className="input-icon" />
          <input
            type="time"
            className="time-input"
            value={timeValue || '09:00'}
            onChange={(e) => onTimeChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}
