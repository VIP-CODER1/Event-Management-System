const express = require('express')
const router = express.Router()
const {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventLogs
} = require('../controllers/eventController')

router.get('/', getEvents)
router.post('/', createEvent)
router.get('/:id', getEvent)
router.patch('/:id', updateEvent)
router.delete('/:id', deleteEvent)
router.get('/:id/logs', getEventLogs)

module.exports = router
