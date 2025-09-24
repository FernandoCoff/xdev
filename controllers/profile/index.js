import { v2 as cloudinary } from 'cloudinary'
import streamifier from 'streamifier'
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

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    })

    const { id } = req.user
    const profile = await Profile.findOne({ user: id })

    if (!profile)
      return res.status(404).json(notFound({ error: 'Perfil não encontrado!' }))

    const uploadPromise = new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          public_id: id,
          folder: 'xdev_avatars',
          transformation: [{ width: 300, height: 300, crop: 'fill' }],
          format: 'webp',
        },
        (error, result) => {
          if (error) {
            return reject(error)
          }
          resolve(result)
        },
      )

      streamifier.createReadStream(req.file.buffer).pipe(uploadStream)
    })

    const uploadResult = await uploadPromise
    profile.avatar = uploadResult.secure_url
    await profile.save()

    return res.status(200).json(
      success({
        message: 'Avatar atualizado com sucesso!',
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
