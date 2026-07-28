const mongoose = require('mongoose')

const logEntrySchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now
  },
  changes: [{
    field: String,
    oldValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed
  }]
}, { _id: false })

const eventSchema = new mongoose.Schema({
  profiles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile',
    required: true
  }],
  timezone: {
    type: String,
    required: [true, 'Timezone is required']
  },
  startDateTime: {
    type: Date,
    required: [true, 'Start date and time is required']
  },
  endDateTime: {
    type: Date,
    required: [true, 'End date and time is required']
  },
  updateLogs: [logEntrySchema]
}, {
  timestamps: true
})

eventSchema.pre('validate', function (next) {
  if (this.endDateTime < this.startDateTime) {
    this.invalidate('endDateTime', 'End date/time must be after start date/time')
  }
  if (!this.profiles || this.profiles.length === 0) {
    this.invalidate('profiles', 'At least one profile must be selected')
  }
  next()
})

eventSchema.index({ profiles: 1 })
eventSchema.index({ startDateTime: 1 })
eventSchema.index({ endDateTime: 1 })

module.exports = mongoose.model('Event', eventSchema)