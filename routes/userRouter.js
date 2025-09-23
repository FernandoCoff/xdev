import { Router } from 'express'
import {
  updatePassword,
  updateUsername,
  getUser,
  updateEmail
} from '../controllers/user/index.js'
import { authMiddleware } from '../middlewares/auth.js'

const router = Router()

router.get('/', authMiddleware, getUser)
router.put('/password', authMiddleware, updatePassword)
router.put('/username', authMiddleware, updateUsername)
router.put('/email', authMiddleware, updateEmail)

export default router
