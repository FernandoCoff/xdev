import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './database/connect.js'
import { serverError } from './helpers/auxiliar.js'
import authRoutes from './routes/authRouter.js'
import userRoutes from './routes/userRouter.js'
import profileRoutes from './routes/profileRouter.js'
import postRoutes from './routes/postRouter.js'
import commentRoutes from './routes/commentRouter.js'
import path from 'path'
import { fileURLToPath } from 'url'


const main = async () => {
  // DATABASE - SE NÃO HOUVER DATABASE O SERVIDOR ENCERRA
  const dbAccess = process.env.DB_KEY || ''
  if (dbAccess === '') {
    serverError('Database accsess undefined')
  }
  connectDB(dbAccess)

  // VARIAVEIS E MIDDLEWARES
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const app = express()
  const port = process.env.PORT || 8000
  app.use(express.json())
  app.use(cors())
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


  // ROTAS - ADICIONE NOVAS ROTAS AQUI
  app.get('/', (req, res) => {
    res.send({ msg: 'Hello, World' })
  })

  app.use('/auth', authRoutes)
  app.use('/user', userRoutes)
  app.use('/profile', profileRoutes)
  app.use('/post', postRoutes)
  app.use('/comment', commentRoutes)

  app.listen(port, () => console.log('SERVER RUNNING!'))
}

main()
