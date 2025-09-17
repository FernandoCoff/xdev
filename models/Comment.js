import { Schema, model } from 'mongoose'

const commentSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'Profile',
      required: true,
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
    },
    content: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

commentSchema.index({ post: 1, createdAt: 1 })
export const Comment = model('Comment', commentSchema)
