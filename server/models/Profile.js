const mongoose = require('mongoose')

const profileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Profile name is required'],
    trim: true,
    unique: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  timezone: {
    type: String,
    required: true,
    default: 'America/New_York'
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('Profile', profileSchema)