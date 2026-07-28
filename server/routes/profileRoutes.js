const express = require('express')
const router = express.Router()
const {
  getProfiles,
  createProfile,
  getProfile,
  updateProfileTimezone
} = require('../controllers/profileController')

router.get('/', getProfiles)
router.post('/', createProfile)
router.get('/:id', getProfile)
router.patch('/:id/timezone', updateProfileTimezone)

module.exports = router
