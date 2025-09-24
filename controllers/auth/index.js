import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import axios from 'axios'
import fs from 'fs/promises'
import path from 'path'
import { User } from '../../models/User.js'
import { Profile } from '../../models/Profile.js'
import {
  serverError,
  created,
  notFound,
  success,
} from '../../helpers/httpRespose.js'
import { getRandomInt } from '../../helpers/auxiliar.js'
import {
  passwordValidation,
  emailValidation,
  usernameValidation,
} from '../../helpers/validation.js'

export const register = async (req, res) => {
  if (!req.body)
    return res
      .status(409)
      .json(serverError({ error: 'Corpo da requisição indisponível!' }))

  try {
    const {
      username: rawUsername,
      email: rawEmail,
      password: rawPassword,
    } = req.body
    const username = rawUsername ? rawUsername.trim() : ''
    const email = rawEmail ? rawEmail.trim() : ''
    const password = rawPassword ? rawPassword.trim() : ''

    const user = await User.findOne({ $or: [{ email }, { username }] })
    if (user)
      return res
        .status(409)
        .json(
          serverError({ error: 'Email e/ou nome de usuário já cadastrado!' }),
        )

    // VALIDAÇÕES PARA CADASTRO
    const validations = [
      usernameValidation(username),
      emailValidation(email),
      passwordValidation(password),
    ]

    for (const result of validations) {
      if (!result.isValid)
        return res.status(409).json(notFound({ error: result.message }))
    }

    // SE A VALIDAÇÃO PASSAR, CADASTRA O USUÁRIO NO BANCO
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    const colors = [
      'E6E6FA',
      'FFB6C1',
      'ADD8E6',
      'F08080',
      '90EE90',
      'FFDAB9',
      'B0E0E6',
      'FFDEAD',
      'DDA0DD',
      '87CEFA',
    ]

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    })

    const initial = username.charAt(0).toUpperCase()
    const color = colors[getRandomInt(0, colors.length - 1)]
    const avatarUrl = `https://placehold.co/300x300/${color}/FFFFFF?font=poppins&text=${initial}`
    const filename = `${newUser._id}.svg`
    const uploadDir = path.resolve(process.cwd(), 'uploads/avatars')
    const localPath = path.join(uploadDir, filename)
    await fs.mkdir(uploadDir, { recursive: true })
    const response = await axios.get(avatarUrl, {
      responseType: 'arraybuffer',
    })
    await fs.writeFile(localPath, response.data)

    const newProfile = new Profile({
      user: newUser._id,
      username: newUser.username,
      avatar: filename,
    })

    newUser.profile = newProfile._id
    await Promise.all([newUser.save(), newProfile.save()])

    const payload = {
      id: newUser.id,
    }

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '1h',
    })

    return res.status(201).json(
      created({
        message: 'Usuário criado com sucesso!',
        token,
      }),
    )
  } catch (error) {
    console.log(error)
    return res
      .status(409)
      .json(
        serverError({ error: 'Não foi possivél concluir a sua solicitação' }),
      )
  }
}

export const login = async (req, res) => {
  if (!req.body)
    return res
      .status(409)
      .json(serverError({ error: 'Corpo da requisição indisponível!' }))

  const { email, password } = req.body

  try {
    const user = await User.findOne({ email })
    if (!user) {
      return res
        .status(401)
        .json(notFound({ error: 'Email e/ou Senha Incorretos.' }))
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res
        .status(401)
        .json(notFound({ error: 'Email e/ou Senha Incorretos.' }))
    }

    const payload = {
      id: user.id,
    }

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '1h',
    })

    res.status(200).json(
      success({
        message: 'Usuário autenticado com sucesso!',
        token,
      }),
    )
  } catch (error) {
    console.log(error)
    return res
      .status(409)
      .json(
        serverError({ error: 'Não foi possivél concluir a sua solicitação' }),
      )
  }
}
