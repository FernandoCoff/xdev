import { model, Schema } from 'mongoose'

const profileSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    avatar: {
      type: String,
      required: true,
    },
    followers: {
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

    following: {
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
    posts: {
      count: {
        type: Number,
        default: 0,
      },
      list: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Post',
        },
      ],
    },
  },
  {
    timestamps: true,
  },
)

export const Profile = model('Profile', profileSchema)
