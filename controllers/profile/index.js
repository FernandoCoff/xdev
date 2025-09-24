import sharp from 'sharp'
import path from 'path'
import fs from 'fs/promises'
import { Profile } from '../../models/Profile.js'
import { notFound, serverError, success } from '../../helpers/httpRespose.js'

export const getProfile = async (req, res) => {
  try {
    const { id } = req.user

    const profile = await Profile.findOne({ user: id })
      .populate({
        path: 'posts.list',
        model: 'Post',
        select: 'content likes comments createdAt',
      })
      .populate({
        path: 'followers.list',
        model: 'Profile',
        select: 'username avatar',
      })
      .populate({
        path: 'following.list',
        model: 'Profile',
        select: 'username avatar',
      })

    if (!profile)
      return res.status(404).json(notFound({ error: 'Perfil não encontrado!' }))

    return res.status(200).json(success(profile))
  } catch (error) {
    console.log(error)

    return res
      .status(409)
      .json(
        serverError({ error: 'Não foi possivél concluir a sua solicitação' }),
      )
  }
}

export const updateAvatar = async (req, res) => {
  try {
    if (!req.file)
      return res
        .status(400)
        .json(notFound({ error: 'Nenhum arquivo de avatar enviado.' }))

    const { id } = req.user
    const profile = await Profile.findOne({ user: id })

    if (!profile)
      return res.status(404).json(notFound({ error: 'Perfil não encontrado!' }))

    const newFilename = `${id}.webp`
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

export const toggleFollow = async (req, res) => {
  try {
    const { id } = req.user
    const targetId = req.params.id

    if (id === targetId) {
      return res
        .status(400)
        .json(
          notFound({
            error: 'Você não pode seguir ou deixar de seguir a si mesmo.',
          }),
        )
    }

    const [profile, targetProfile] = await Promise.all([
      Profile.findOne({ user: id }),
      Profile.findById(targetId),
    ])

    if (!profile || !targetProfile) {
      return res
        .status(404)
        .json(notFound({ error: 'Usuário ou perfil não encontrado.' }))
    }

    const isFollowing = profile.following.list.includes(targetProfile._id)

    const operator = isFollowing ? '$pull' : '$push'
    const increment = isFollowing ? -1 : 1

    await Promise.all([
      Profile.updateOne(
        { _id: profile._id },
        {
          [operator]: { 'following.list': targetProfile._id },
          $inc: { 'following.count': increment },
        },
      ),
      Profile.updateOne(
        { _id: targetProfile._id },
        {
          [operator]: { 'followers.list': profile._id },
          $inc: { 'followers.count': increment },
        },
      ),
    ])

    const successMessage = isFollowing
      ? `Você deixou de seguir ${targetProfile.username}.`
      : `Você começou a seguir ${targetProfile.username}.`

    return res.status(200).json(success({ message: successMessage }))
  } catch (error) {
    console.log(error)
    return res
      .status(500)
      .json(
        serverError({ error: 'Não foi possível concluir a sua solicitação.' }),
      )
  }
}

export const getAllProfiles = async (req, res) => {
  try {
    const { id } = req.user
    const profiles = await Profile.find(
      { user: { $ne: id } },
      'username avatar user',
    )
    return res.status(200).json(success({ profiles }))
  } catch (error) {
    console.log(error)
    return res
      .status(500)
      .json(
        serverError({ error: 'Não foi possivél concluir a sua solicitação' }),
      )
  }
}

export const getFollowingProfiles = async (req, res) => {
  try {
    const { id } = req.user
    const profile = await Profile.findOne({ user: id }).populate({
      path: 'following.list',
      select: 'username avatar user',
    })

    if (!profile) {
      return res.status(404).json(notFound({ error: 'Perfil não encontrado!' }))
    }

    return res.status(200).json(success({ following: profile.following.list }))
  } catch (error) {
    console.log(error)
    return res
      .status(500)
      .json(
        serverError({ error: 'Não foi possivél concluir a sua solicitação' }),
      )
  }
}

export const getFollowerProfiles = async (req, res) => {
  try {
    const { id } = req.user
    const profile = await Profile.findOne({ user: id }).populate({
      path: 'followers.list',
      select: 'username avatar user',
    })

    if (!profile) {
      return res.status(404).json(notFound({ error: 'Perfil não encontrado!' }))
    }

    return res.status(200).json(success({ followers: profile.followers.list }))
  } catch (error) {
    console.log(error)
    return res
      .status(500)
      .json(
        serverError({ error: 'Não foi possivél concluir a sua solicitação' }),
      )
  }
}
