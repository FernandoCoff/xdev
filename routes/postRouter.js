import { Router } from 'express'
import { createPost, toggleLikePost, getAllPosts, getFollowingPosts, getPostById } from '../controllers/post/index.js'
import { authMiddleware } from '../middlewares/auth.js'

const router = Router()

router.get('/', authMiddleware, getAllPosts)
router.get('/:id', authMiddleware, getPostById)
router.get('/following', authMiddleware, getFollowingPosts)
router.post('/create', authMiddleware, createPost)
router.post('/toggle-like/:id', authMiddleware, toggleLikePost)

export default router
