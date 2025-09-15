import express from 'express'
import 'dotenv/config'

const app = express()

app.get('/', (req, res) => {
  res.send({ msg: 'Olá' })
})

app.listen(8000, () => console.log('SERVER RUNNING!'))
