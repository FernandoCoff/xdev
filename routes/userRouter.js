import { Router } from 'express'
import { updatePassword, updateUsername } from '../controllers/user/index.js'

const router = Router()

router.put('/password/:id', updatePassword)
router.put('/username/:id', updateUsername)

export default router
