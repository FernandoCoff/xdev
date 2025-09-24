import { Post } from '../../models/Post.js'
import { Profile } from '../../models/Profile.js'
import { notFound, serverError, success } from '../../helpers/httpRespose.js'

export const createPost = async (req, res) => {
  if (!req.body)
    return res
      .status(409)
      .json(serverError({ error: 'Corpo da requisição indisponível!' }))

  try {
    const { id } = req.user
    const profile = await Profile.findOne({ user: id })

    if (!profile)
      return res.status(404).json(notFound({ error: 'Perfil não encontrado!' }))

    const { contentPost: rawContentPost } = req.body
    const contentPost = rawContentPost ? rawContentPost.trim() : ''

    if (contentPost === '')
      return res
        .status(404)
        .json(notFound({ error: 'O conteúdo do post é obrigatório!' }))

    const newPost = new Post({
      user: profile._id,
      content: contentPost,
    })

    await newPost.save()

    profile.posts.list.push(newPost._id)
    profile.posts.count++
    await profile.save()

    return res
      .status(200)
      .json(success({ message: 'Post criado com sucesso!' }))
  } catch (error) {
    console.log(error)
    return res
      .status(409)
      .json(
        serverError({ error: 'Não foi possivél concluir a sua solicitação' }),
      )
  }
}

export const toggleLikePost = async (req, res) => {
  if (!req.params.id)
    return res
      .status(400)
      .json(notFound({ error: 'O id do post é obrigatório!' }))

  try {
    const { id } = req.user
    const profile = await Profile.findOne({ user: id })

    if (!profile)
      return res.status(404).json(notFound({ error: 'Perfil não encontrado!' }))

    const post = await Post.findById(req.params.id)
    if (!post)
      return res.status(404).json(notFound({ error: 'Post não econtrado!' }))

    const isLiked = post.likes.list.some((id) => id.equals(profile._id))

    if (!isLiked) {
      post.likes.list.push(profile._id)
      post.likes.count++
      await post.save()
      return res
        .status(200)
        .json(success({ message: 'Post curtido com sucesso!' }))
    }

    const newListLikedPost = post.likes.list.filter(
      (likedProfileId) => !likedProfileId.equals(profile._id),
    )
    post.likes.list = newListLikedPost
    post.likes.count--
    await post.save()
    return res
      .status(200)
      .json(success({ message: 'Curtida removida com sucesso!' }))
  } catch (error) {
    console.log(error)
    return res
      .status(409)
      .json(
        serverError({ error: 'Não foi possivél concluir a sua solicitação' }),
      )
  }
}

export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate({
        path: 'user',
        select: 'user avatar username',
      })
      .sort({ createdAt: -1 })

    return res.status(200).json(success({ posts }))
  } catch (error) {
    console.log(error)
    return res
      .status(500)
      .json(
        serverError({ error: 'Não foi possivél concluir a sua solicitação' }),
      )
  }
}

export const getFollowingPosts = async (req, res) => {
  try {
    const { id } = req.user
    const profile = await Profile.findOne({ user: id })

    if (!profile)
      return res.status(404).json(notFound({ error: 'Perfil não encontrado!' }))

    const followingIds = profile.following.list
    const userIds = [...followingIds, profile._id]

    const posts = await Post.find({ user: { $in: userIds } })
      .populate({
        path: 'user',
        select: 'user avatar username',
      })
      .sort({ createdAt: -1 })

    return res.status(200).json(success({ posts }))
  } catch (error) {
    console.log(error)
    return res
      .status(500)
      .json(
        serverError({ error: 'Não foi possivél concluir a sua solicitação' }),
      )
  }
}

export const getPostById = async (req, res) => {
  if (!req.params.id) {
    return res
      .status(400)
      .json(notFound({ error: 'O id do post é obrigatório!' }))
  }

  try {
    const post = await Post.findById(req.params.id)
      .populate({
        path: 'user',
        select: 'user avatar username',
      })
      .populate({
        path: 'comments.list',
        populate: {
          path: 'user',
          select: 'user avatar username',
        },
      })

    if (!post) {
      return res.status(404).json(notFound({ error: 'Post não encontrado!' }))
    }

    return res.status(200).json(success({ post }))
  } catch (error) {
    console.log(error)
    return res
      .status(500)
      .json(
        serverError({ error: 'Não foi possível concluir a sua solicitação' }),
      )
  }
}
