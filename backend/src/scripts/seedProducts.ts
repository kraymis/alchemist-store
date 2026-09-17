import 'dotenv/config'
import { connectDatabase } from '../config/database.js'
import { Product } from '../models/Product.js'

const products = [
  { sku: 'ALC-TS-BLK-001', name: 'T-Shirt Essential Black', description: 'Jersey de coton épais, coupe droite et logo discret.', category: 'T-Shirts', collection: 'Essentials', price: 2200, colors: ['Black', 'White'], sizes: ['S', 'M', 'L', 'XL'], stock: 32, active: true, featured: true, label: 'Bestseller', images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=85'] },
  { sku: 'ALC-SW-ECR-001', name: 'Sweat Studio Ecru', description: 'Sweat confortable aux finitions soignées pour les journées fraîches.', category: 'Sweatshirts', collection: 'Studio', price: 4200, colors: ['Beige', 'Grey'], sizes: ['S', 'M', 'L', 'XL', 'XXL'], stock: 18, active: true, newest: true, label: 'New', images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=1200&q=85'] },
  { sku: 'ALC-HD-GRY-001', name: 'Hoodie Atelier Grey', description: 'Hoodie structuré, sobre et polyvalent.', category: 'Hoodies', collection: 'Atelier', price: 4800, colors: ['Grey', 'Black'], sizes: ['M', 'L', 'XL', 'XXL'], stock: 14, active: true, featured: true, images: ['https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=1200&q=85'] },
  { sku: 'ALC-PT-SND-001', name: 'Pantalon Relax Sand', description: 'Pantalon décontracté dans une teinte neutre.', category: 'Pants', collection: 'Essentials', price: 3900, colors: ['Beige', 'Black'], sizes: ['S', 'M', 'L', 'XL'], stock: 21, active: true, images: ['https://images.unsplash.com/photo-1517438476312-10d79c077509?auto=format&fit=crop&w=1200&q=85'] },
  { sku: 'ALC-CP-BLK-001', name: 'Casquette Signature Black', description: 'Casquette ajustable, finition signature.', category: 'Accessories', collection: 'Signature', price: 1800, colors: ['Black'], sizes: ['Unique'], stock: 25, active: true, newest: true, label: 'New', images: ['https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=1200&q=85'] },
]
await connectDatabase()
for (const product of products) await Product.updateOne({ sku: product.sku }, { $set: product }, { upsert: true })
console.log(`${products.length} produits MongoDB créés ou mis à jour`)
process.exit(0)
