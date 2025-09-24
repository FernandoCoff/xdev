import { Router } from 'express'
import {
  updateAvatar,
  toggleFollow,
  getProfile,
  getAllProfiles,
  getFollowerProfiles,
  getFollowingProfiles,
} from '../controllers/profile/index.js'
import { authMiddleware } from '../middlewares/auth.js'
import upload from '../helpers/upload.js'

const router = Router()
router.get('/', authMiddleware, getProfile)
router.get('/all', authMiddleware, getAllProfiles)
router.get('/follower', authMiddleware, getFollowerProfiles)
router.get('/following', authMiddleware, getFollowingProfiles)
router.put('/avatar', authMiddleware, upload.single('avatar'), updateAvatar)
router.post('/follow/:id', authMiddleware, toggleFollow)

export default router
