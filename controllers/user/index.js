import bcrypt from 'bcryptjs'
import { User } from '../../models/User.js'
import { Profile } from '../../models/Profile.js'
import { notFound, serverError, success } from '../../helpers/httpRespose.js'
import {
  passwordValidation,
  usernameValidation,
} from '../../helpers/validation.js'

export const updatePassword = async (req, res) => {
  if (!req.body)
    return res
      .status(409)
      .json(serverError({ error: 'Corpo da requisição indisponível!' }))

  try {
    const { id } = req.params
    const user = await User.findById(id)

    if (!user)
      return res
        .status(404)
        .json(notFound({ error: 'Usuário não encontrado!' }))

    const { newPassword: rawNewPassword, oldPassword: rawOldPassword } =
      req.body
    const newPassword = rawNewPassword ? rawNewPassword.trim() : ''
    const oldPassword = rawOldPassword ? rawOldPassword.trim() : ''

    const isMatch = await bcrypt.compare(oldPassword, user.password)
    if (!isMatch) {
      return res.status(404).json(notFound({ error: 'Senha inválida.' }))
    }

    if (oldPassword === newPassword)
      return res.status(404).json(
        notFound({
          error: 'A nova senha não pode ser igual à senha antiga.',
        }),
      )

    const validation = passwordValidation(newPassword)
    if (!validation.isValid)
      return res.status(404).json(notFound({ error: validation.message }))

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(newPassword, salt)

    user.password = hashedPassword
    await user.save()

    return res
      .status(200)
      .json(success({ message: 'Senha atualizada com sucesso!' }))
  } catch (error) {
    console.log(error)
    return res
      .status(409)
      .json(
        serverError({ error: 'Não foi possivél concluir a sua solicitação' }),
      )
  }
}

export const updateUsername = async (req, res) => {
  if (!req.body)
    return res
      .status(409)
      .json(serverError({ error: 'Corpo da requisição indisponível!' }))

  try {
    const { id } = req.params
    const user = await User.findById(id)

    if (!user)
      return res
        .status(404)
        .json(notFound({ error: 'Usuário não encontrado!' }))

    const { newUsername: rawNewUsername, password } = req.body
    const newUsername = rawNewUsername ? rawNewUsername.trim() : ''

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(404).json(notFound({ error: 'Senha inválida.' }))
    }

    if (newUsername === user.username)
      return res.status(404).json(
        notFound({
          error: 'O novo nome de usuário precisa ser diferente do antigo',
        }),
      )

    const isIndisponible = await User.findOne({ username: newUsername })
    if (isIndisponible)
      return res
        .status(409)
        .json(serverError({ error: 'Nome de usuário indisponível' }))

    const validation = usernameValidation(newUsername)
    if (!validation.isValid)
      return res.status(404).json(notFound({ error: validation.message }))

    const userProfile = await Profile.findOne({ user: user._id })
    user.username = newUsername
    if (userProfile) {
      userProfile.username = newUsername
    }

    if (userProfile) {
      await Promise.all([user.save(), userProfile.save()])
    } else {
      await user.save()
    }

    return res
      .status(200)
      .json(success({ message: 'Nome de usuário atualizado com sucesso!' }))
  } catch (error) {
    console.log(error)
    return res
      .status(409)
      .json(
        serverError({ error: 'Não foi possivél concluir a sua solicitação' }),
      )
  }
}
