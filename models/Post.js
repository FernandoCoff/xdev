import { Schema, model } from 'mongoose'

const postSchema = new Schema(
  {
    index: true,
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
      type: Number,
      default: 0,
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

export const Post = model('Post', postSchema)
