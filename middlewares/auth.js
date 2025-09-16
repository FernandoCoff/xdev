import jwt from 'jsonwebtoken'
import { notFound } from '../helpers/httpRespose.js'

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    return res.status(404).json(notFound({ error: 'Acesso negado. Nenhum token fornecido.' }))
  }

  const parts = authHeader.split(' ')

  if (parts.length !== 2) {
    return res.status(404).json(notFound({ error: 'Token inválido.' }))
  }

  const [scheme, token] = parts

  if (!/^Bearer$/i.test(scheme)) {
    return res.status(404).json(notFound({ error: 'Token inválido.' }))
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = { id: decoded.id }
    return next()

  } catch{
    return res
    .status(404)
    .json(notFound({ error: 'Token inválido ou expirado, faça login novamente!' }))
  }
}
