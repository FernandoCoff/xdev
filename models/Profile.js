import { model, Schema } from 'mongoose'

const profileSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    avatar: {
      type: String,
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
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

profileSchema.virtual('avatar_url').get(function () {
  if (this.avatar) {
    return `${process.env.API_URL}/uploads/avatars/${this.avatar}`
  }
  return null
})

export const Profile = model('Profile', profileSchema)
