import { Router } from "express"
import { updateAvatar, follow, unFollow } from "../controllers/profile/index.js"
import { authMiddleware } from "../middlewares/auth.js"
import upload from '../helpers/upload.js'

const router = Router()

router.put('/avatar', authMiddleware, upload.single('avatar'), updateAvatar)
router.post('/follow/:id', authMiddleware, follow)
router.delete('/unfollow/:id', authMiddleware, unFollow)

export default router
