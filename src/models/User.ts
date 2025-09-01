import mongoose, {
  Schema,
  model,
  InferSchemaType,
  HydratedDocument,
} from 'mongoose'
import jwt, { SignOptions } from 'jsonwebtoken'
import { systemConfig } from '@/config'

// Define schema first (no types yet)
const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    avatar: { type: String, required: true },
    authId: { type: String, required: true },
    authProvider: {
      type: String,
      enum: ['google', 'github'],
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

// Infer TypeScript type from the schema
type UserType = InferSchemaType<typeof userSchema>
type UserDoc = HydratedDocument<UserType>

// Add instance method
userSchema.methods.generateToken = function (this: UserDoc): string {
  const options: SignOptions = {
    expiresIn: systemConfig.jwtExpire,
    algorithm: 'HS256',
  }

  return jwt.sign({ id: this._id }, systemConfig.jwtSecret, options)
}

// Export model and types
const User = mongoose.models.User || model<UserType>('User', userSchema)
export default User
export type { UserType }
