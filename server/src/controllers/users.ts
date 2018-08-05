import User, { UserModel, UserDTO } from '../models/user'
import Errors from '../constants/errors'
import { Document } from 'mongoose'

export default class UsersController {

  public static findById = async (id: string, build: boolean = false): Promise<UserModel|UserDTO> => {
    return new Promise<UserModel|UserDTO>((resolve, reject) => {
      User.findById(id, (err, user: UserModel) => {
        if (err) reject(Errors.databaseAccess(err))
        else if (user == null) reject(Errors.ressourceNotFound({ type: 'user', id }))
        else if (build) resolve(UsersController.userBuilder(user))
        else resolve(user)
      })
    })
  }

  public static userBuilder = (user: UserModel): UserDTO => {
    return {
      id: user._id,
      name: user.name,
      email: user.email
    }
  }
  
  public static save = async (user: Document, build: boolean = false): Promise<UserModel|UserDTO> => {
    return new Promise<UserModel|UserDTO>((resolve, reject) => {
      user.save((err, savedUser: UserModel) => {
        if (err) reject(Errors.databaseAccess(err))
        else if (build) resolve(UsersController.userBuilder(savedUser))
        else resolve(savedUser)
      })
    })
  }
}
