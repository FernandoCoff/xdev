import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './database/connect.js'
import authRoutes from './routes/authRouter.js'
import userRoutes from './routes/userRouter.js'
import profileRoutes from './routes/profileRouter.js'
import postRoutes from './routes/postRouter.js'
import commentRoutes from './routes/commentRouter.js'

const dbAccess = process.env.DB_KEY || ''
if (dbAccess === '') {
  console.error('Database access key (DB_KEY) is not defined in .env')
  process.exit(1)
}
connectDB(dbAccess)

const app = express()
app.use(express.json())
app.use(cors())

app.get('/', (req, res) => {
  res.send({ msg: 'API is running successfully!' })
})

app.use('/auth', authRoutes)
app.use('/user', userRoutes)
app.use('/profile', profileRoutes)
app.use('/post', postRoutes)
app.use('/comment', commentRoutes)

export default app
