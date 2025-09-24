import { Comment } from '../../models/Comment.js'
import { Post } from '../../models/Post.js'
import { Profile } from '../../models/Profile.js'
import { notFound, serverError, success } from '../../helpers/httpRespose.js'

export const addComment = async (req, res) => {
  if (!req.body)
    return res
      .status(409)
      .json(serverError({ error: 'Corpo da requisição indisponível!' }))
  try {
    const { id } = req.user
    const profile = await Profile.findOne({ user: id })

    if (!profile)
      return res.status(404).json(notFound({ error: 'Perfil não encontrado!' }))

    const post = await Post.findById(req.params.id)
    if (!post)
      return res.status(404).json(notFound({ error: 'Post não encontrado!' }))

    const { contentComment: rawContentComment } = req.body
    const contentComment = rawContentComment ? rawContentComment.trim() : ''

    if (contentComment === '')
      return res
        .status(404)
        .json(notFound({ error: 'O conteúdo do comentário é obrigatório!' }))

    const newComment = new Comment({
      user: profile._id,
      content: contentComment,
      post: post._id,
    })

    post.comments.list.push(newComment._id)
    post.comments.count++

    await Promise.all([newComment.save(), post.save()])

    return res
      .status(200)
      .json(success({ message: 'Comentário criado com sucesso!' }))
  } catch (error) {
    console.log(error)
    return res
      .status(409)
      .json(
        serverError({ error: 'Não foi possivél concluir a sua solicitação' }),
      )
  }
}
