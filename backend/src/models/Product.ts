import { Schema, model } from 'mongoose'
import { PRODUCT_CATEGORIES, PRODUCT_COLORS } from '../config/catalog.js'

const variantSchema = new Schema({ color: { type: String, required: true }, size: { type: String, required: true }, stock: { type: Number, min: 0, default: 0 } }, { _id: false })

export const Product = model('Product', new Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true, min: 0 },
  salePrice: { type: Number, min: 0 },
  category: { type: String, enum: PRODUCT_CATEGORIES, required: true },
  collection: { type: String, default: '' },
  images: { type: [String], default: [] },
  sizes: { type: [String], default: [] },
  colors: { type: [String], enum: PRODUCT_COLORS.map((color) => color.name), default: [] },
  variants: { type: [variantSchema], default: [] },
  stock: { type: Number, min: 0, default: 0 },
  sku: { type: String, trim: true, sparse: true, unique: true },
  active: { type: Boolean, default: true },
  label: { type: String, default: '' },
  featured: { type: Boolean, default: false },
  newest: { type: Boolean, default: false },
  visual: { type: String, default: '' },
}, { timestamps: true }))
