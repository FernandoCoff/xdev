import { Router } from 'express'
import { addComment } from '../controllers/comment/index.js'
import { authMiddleware } from '../middlewares/auth.js'

const router = Router()

router.post('/add/:id', authMiddleware, addComment)

export default router
