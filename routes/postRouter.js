import { Router } from 'express'
import { createPost, toggleLikePost } from '../controllers/post/index.js'
import { authMiddleware } from '../middlewares/auth.js'

const router = Router()

router.post('/create', authMiddleware, createPost)
router.post('/toggle-like/:id', authMiddleware, toggleLikePost)

export default router
