import mongoose from 'mongoose'
import { serverError } from '../helpers/auxiliar.js'

const connectDB = async (dbAccess) => {
  try {
    await mongoose.connect(dbAccess)
    console.log('DB CONNECTED!')
  } catch (error) {
    serverError(error)
  }
}

export default connectDB
