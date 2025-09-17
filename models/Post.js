import { Schema, model } from 'mongoose'

const postSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'Profile',
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    likes: {
      count: {
        type: Number,
        default: 0,
      },
      list: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Profile',
        },
      ],
    },
    comments: {
      count: {
        type: Number,
        default: 0,
      },
      list: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Comment',
        },
      ],
    },
  },
  {
    timestamps: true,
  },
)

postSchema.index({ user: 1, createdAt: -1 })
export const Post = model('Post', postSchema)
