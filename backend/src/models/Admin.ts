import { Schema, model } from 'mongoose'
export const Admin = model('Admin', new Schema({ username: { type: String, required: true, unique: true, trim: true }, passwordHash: { type: String, required: true } }, { timestamps: true }))
