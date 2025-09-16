import { Router } from 'express'
import { updatePassword, updateUsername } from '../controllers/user/index.js'
import { authMiddleware } from '../middlewares/auth.js'

const router = Router()

router.put('/password', authMiddleware, updatePassword)
router.put('/username', authMiddleware, updateUsername)

export default router
