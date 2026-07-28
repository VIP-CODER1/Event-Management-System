const Profile = require('../models/Profile')

const getProfiles = async (req, res, next) => {
  try {
    const profiles = await Profile.find().sort({ name: 1 })
    res.json(profiles)
  } catch (error) {
    next(error)
  }
}

const createProfile = async (req, res, next) => {
  try {
    const { name, timezone } = req.body
    const trimmed = name?.trim()
    if (!trimmed || trimmed.length < 2) {
      res.status(400)
      throw new Error('Profile name must be at least 2 characters')
    }
    const exists = await Profile.findOne({ name: trimmed })
    if (exists) {
      res.status(400)
      throw new Error('A profile with this name already exists')
    }
    const profile = await Profile.create({
      name: trimmed,
      timezone: timezone || 'America/New_York'
    })
    res.status(201).json(profile)
  } catch (error) {
    next(error)
  }
}

const getProfile = async (req, res, next) => {
  try {
    const profile = await Profile.findById(req.params.id)
    if (!profile) {
      res.status(404)
      throw new Error('Profile not found')
    }
    res.json(profile)
  } catch (error) {
    next(error)
  }
}

const updateProfileTimezone = async (req, res, next) => {
  try {
    const { timezone } = req.body
    if (!timezone) {
      res.status(400)
      throw new Error('Timezone is required')
    }
    const profile = await Profile.findByIdAndUpdate(
      req.params.id,
      { timezone },
      { new: true, runValidators: true }
    )
    if (!profile) {
      res.status(404)
      throw new Error('Profile not found')
    }
    res.json(profile)
  } catch (error) {
    next(error)
  }
}

module.exports = { getProfiles, createProfile, getProfile, updateProfileTimezone }
