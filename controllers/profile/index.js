import sharp from 'sharp'
import path from 'path'
import fs from 'fs/promises'
import { Profile } from '../../models/Profile.js'
import { User } from '../../models/User.js'
import { notFound, serverError, success } from '../../helpers/httpRespose.js'

export const updateAvatar = async (req, res) => {
  try {
    if (!req.file)
      return res
        .status(400)
        .json(notFound({ error: 'Nenhum arquivo de avatar enviado.' }))

    const { id } = req.params
    const user = await User.findById(id)

    if (!user)
      return res
        .status(404)
        .json(notFound({ error: 'Usuário não encontrado!' }))

    const profile = await Profile.findById(user.profile)
    if (!profile)
      return res.status(404).json(notFound({ error: 'Perfil não encontrado!' }))

    const newFilename = `${user._id}.webp`
    const finalPath = path.resolve('uploads', 'avatars', newFilename)

    await sharp(req.file.path)
      .resize(300, 300)
      .toFormat('webp')
      .toFile(finalPath)

    await fs.unlink(req.file.path)

    profile.avatar = newFilename
    await profile.save()

    return res.status(200).json(
      success({
        message: 'Avatar atualizado com sucesso!',
      }),
    )
  } catch (error) {
    console.log(error)

    if (req.file) {
      await fs.unlink(req.file.path)
    }

    return res
      .status(409)
      .json(
        serverError({ error: 'Não foi possivél concluir a sua solicitação' }),
      )
  }
}

export const follow = async (req, res) => {
  try {
    const followerUserId = req.user.id
    const targetUserId = req.params.id

    if (followerUserId === targetUserId)
      return res
        .status(404)
        .json(notFound({ error: 'Você não pode seguir a si mesmo.' }))

    const followerProfile = await Profile.findOne({ user: followerUserId })
    const targetProfile = await Profile.findOne({ user: targetUserId })

    if (!followerProfile || !targetProfile)
      return res
        .status(404)
        .json(notFound({ error: 'Usuário ou perfil não encontrado.' }))

    if (followerProfile.following.list.includes(targetProfile._id)) {
      return res
        .status(404)
        .json(notFound({ error: 'Você já segue este usuário.' }))
    }

    await Profile.updateOne(
      { _id: followerProfile._id },
      {
        $push: { 'following.list': targetProfile._id },
        $inc: { 'following.count': 1 },
      },
    )

    await Profile.updateOne(
      { _id: targetProfile._id },
      {
        $push: { 'followers.list': followerProfile._id },
        $inc: { 'followers.count': 1 },
      },
    )

    return res.status(200).json(
      success({
        message: `Você começou a seguir ${targetProfile.username}.`,
      }),
    )
  } catch (error) {
    console.log(error)

    return res
      .status(404)
      .json(
        serverError({ error: 'Não foi possivél concluir a sua solicitação' }),
      )
  }
}

export const unFollow = async (req, res) => {
  try {
    const followerUserId = req.user.id
    const targetUserId = req.params.id

    if (followerUserId === targetUserId) {
      return res
        .status(404)
        .json(notFound({ error: 'Você não pode deixar de seguir a si mesmo.' }))
    }

    const followerProfile = await Profile.findOne({ user: followerUserId })
    const targetProfile = await Profile.findOne({ user: targetUserId })

    if (!followerProfile || !targetProfile)
      return res
        .status(404)
        .json(notFound({ error: 'Usuário ou perfil não encontrado.' }))

    if (!followerProfile.following.list.includes(targetProfile._id))
      return res
        .status(404)
        .json(notFound({ error: 'Você não segue este usuário.' }))

    await Profile.updateOne(
      { _id: followerProfile._id },
      {
        $pull: { 'following.list': targetProfile._id },
        $inc: { 'following.count': -1 },
      },
    )

    await Profile.updateOne(
      { _id: targetProfile._id },
      {
        $pull: { 'followers.list': followerProfile._id },
        $inc: { 'followers.count': -1 },
      },
    )

    return res.status(200).json(
      success({
        message: `Você deixou de seguir ${targetProfile.username}.`,
      }),
    )
  } catch (error) {
    console.log(error)
    return res
      .status(409)
      .json(serverError({ error: 'Não foi possível concluir a solicitação.' }))
  }
}
