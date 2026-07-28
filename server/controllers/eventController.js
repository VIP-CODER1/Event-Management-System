const Event = require('../models/Event')

const getEvents = async (req, res, next) => {
  try {
    let query = {}
    if (req.query.profileId) {
      query.profiles = req.query.profileId
    }
    const events = await Event.find(query)
      .populate('profiles', 'name timezone')
      .sort({ startDateTime: -1 })
    res.json(events)
  } catch (error) {
    next(error)
  }
}

const getEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('profiles', 'name timezone')
    if (!event) {
      res.status(404)
      throw new Error('Event not found')
    }
    res.json(event)
  } catch (error) {
    next(error)
  }
}

const createEvent = async (req, res, next) => {
  try {
    const { profiles, timezone, startDateTime, endDateTime } = req.body
    if (!profiles || profiles.length === 0) {
      res.status(400)
      throw new Error('At least one profile must be selected')
    }
    if (!startDateTime || !endDateTime) {
      res.status(400)
      throw new Error('Start and end date/time are required')
    }
    const start = new Date(startDateTime)
    const end = new Date(endDateTime)
    if (end < start) {
      res.status(400)
      throw new Error('End date/time must be after start date/time')
    }
    const event = await Event.create({
      profiles,
      timezone: timezone || 'America/New_York',
      startDateTime: start,
      endDateTime: end
    })
    const populated = await event.populate('profiles', 'name timezone')
    res.status(201).json(populated)
  } catch (error) {
    next(error)
  }
}

const updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
    if (!event) {
      res.status(404)
      throw new Error('Event not found')
    }
    const { profiles, timezone, startDateTime, endDateTime } = req.body
    const changes = []

    if (profiles !== undefined) {
      const currentStr = event.profiles.map(p => p.toString()).sort().join(',')
      const newStr = [...profiles].sort().join(',')
      if (currentStr !== newStr) {
        changes.push({ field: 'profiles', oldValue: event.profiles, newValue: profiles })
        event.profiles = profiles
      }
    }
    if (timezone !== undefined && timezone !== event.timezone) {
      changes.push({ field: 'timezone', oldValue: event.timezone, newValue: timezone })
      event.timezone = timezone
    }
    if (startDateTime !== undefined) {
      const newStart = new Date(startDateTime)
      if (newStart.getTime() !== event.startDateTime.getTime()) {
        changes.push({ field: 'startDateTime', oldValue: event.startDateTime, newValue: newStart })
        event.startDateTime = newStart
      }
    }
    if (endDateTime !== undefined) {
      const newEnd = new Date(endDateTime)
      if (newEnd.getTime() !== event.endDateTime.getTime()) {
        changes.push({ field: 'endDateTime', oldValue: event.endDateTime, newValue: newEnd })
        event.endDateTime = newEnd
      }
    }
    if (event.endDateTime < event.startDateTime) {
      res.status(400)
      throw new Error('End date/time must be after start date/time')
    }
    if (changes.length > 0) {
      event.updateLogs.push({
        timestamp: new Date(),
        changes
      })
    }
    const updated = await event.save()
    const populated = await updated.populate('profiles', 'name timezone')
    res.json(populated)
  } catch (error) {
    next(error)
  }
}

const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id)
    if (!event) {
      res.status(404)
      throw new Error('Event not found')
    }
    res.json({ message: 'Event deleted successfully' })
  } catch (error) {
    next(error)
  }
}

const getEventLogs = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('profiles', 'name timezone')
    if (!event) {
      res.status(404)
      throw new Error('Event not found')
    }
    res.json(event.updateLogs)
  } catch (error) {
    next(error)
  }
}

module.exports = { getEvents, getEvent, createEvent, updateEvent, deleteEvent, getEventLogs }
