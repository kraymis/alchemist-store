import 'dotenv/config'
import { connectDatabase } from '../config/database.js'
import { Product } from '../models/Product.js'

const unsplash = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=85`

type SeedProduct = {
  sku: string
  name: string
  description: string
  category: string
  collection: string
  price: number
  colors: string[]
  sizes: string[]
  stock: number
  images: string[]
  label?: string
  featured?: boolean
  newest?: boolean
}

const products: SeedProduct[] = [
  { sku: 'ALC-TS-BLK-001', name: 'T-Shirt Essential Black', description: 'Jersey de coton confortable, coupe droite et col rond côtelé. Une base facile à porter seule ou sous une surchemise.', category: 'T-Shirts', collection: 'Essentials', price: 2200, colors: ['Black', 'White'], sizes: ['S', 'M', 'L', 'XL'], stock: 32, featured: true, label: 'Bestseller', images: [unsplash('photo-1521572163474-6864f9cf17ab'), unsplash('photo-1503342217505-b0a15ec3261c')] },
  { sku: 'ALC-TS-WHT-002', name: 'T-Shirt Heavy Cotton White', description: 'T-shirt blanc en jersey dense avec une silhouette légèrement ample, des manches structurées et une finition nette au col.', category: 'T-Shirts', collection: 'Essentials', price: 2400, colors: ['White', 'Grey'], sizes: ['S', 'M', 'L', 'XL', 'XXL'], stock: 28, newest: true, label: 'New', images: [unsplash('photo-1521572163474-6864f9cf17ab'), unsplash('photo-1529139574466-a303027c1d8b')] },
  { sku: 'ALC-TS-RED-003', name: 'T-Shirt Contrast Red', description: 'T-shirt rouge à la présence graphique, pensé pour les looks streetwear avec un jean ou un pantalon ample.', category: 'T-Shirts', collection: 'Color Stories', price: 2600, colors: ['Red', 'Black'], sizes: ['S', 'M', 'L', 'XL'], stock: 24, images: [unsplash('photo-1562157873-818bc0726f68'), unsplash('photo-1523381210434-271e8be1f52b')] },
  { sku: 'ALC-TS-BLU-004', name: 'T-Shirt Mineral Blue', description: 'Jersey souple dans un bleu minéral, coupe relax et détails minimalistes pour une tenue quotidienne.', category: 'T-Shirts', collection: 'Color Stories', price: 2600, colors: ['Blue', 'White'], sizes: ['S', 'M', 'L', 'XL'], stock: 19, images: [unsplash('photo-1503341504253-dff4815485f1'), unsplash('photo-1512436991641-6745cdb1723f')] },
  { sku: 'ALC-TS-GRN-005', name: 'T-Shirt Forest Logo', description: 'T-shirt vert profond à la coupe régulière, avec une matière douce et un style inspiré des uniformes urbains.', category: 'T-Shirts', collection: 'Color Stories', price: 2700, colors: ['Green', 'Black'], sizes: ['S', 'M', 'L', 'XL'], stock: 22, images: [unsplash('photo-1503342217505-b0a15ec3261c'), unsplash('photo-1489987707025-afc232f7ea0f')] },
  { sku: 'ALC-TS-GRY-006', name: 'T-Shirt Washed Grey', description: 'T-shirt gris délavé au tombé souple et à la coupe légèrement oversize. Une pièce facile pour superposer les textures.', category: 'T-Shirts', collection: 'Studio', price: 2800, colors: ['Grey', 'Black'], sizes: ['S', 'M', 'L', 'XL', 'XXL'], stock: 17, newest: true, images: [unsplash('photo-1551488831-00ddcb6c6bd3'), unsplash('photo-1556821840-3a63f95609a7')] },
  { sku: 'ALC-TS-BEI-007', name: 'T-Shirt Sand Rib', description: 'Modèle sable à texture subtile, col rond et manches courtes. Sa teinte neutre accompagne les silhouettes monochromes.', category: 'T-Shirts', collection: 'Essentials', price: 2500, colors: ['Beige', 'White'], sizes: ['S', 'M', 'L', 'XL'], stock: 26, images: [unsplash('photo-1529139574466-a303027c1d8b'), unsplash('photo-1515886657613-9f3515b0c78f')] },
  { sku: 'ALC-TS-PNK-008', name: 'T-Shirt Dusty Pink', description: 'T-shirt rose poudré à la coupe droite, pensé pour apporter une note douce à une tenue casual.', category: 'T-Shirts', collection: 'Color Stories', price: 2500, colors: ['Pink', 'White'], sizes: ['XS', 'S', 'M', 'L', 'XL'], stock: 15, images: [unsplash('photo-1485230895905-ec40ba36b9bc'), unsplash('photo-1521572163474-6864f9cf17ab')] },

  { sku: 'ALC-HD-GRY-001', name: 'Hoodie Atelier Grey', description: 'Sweat à capuche en molleton confortable, poche kangourou et coupe structurée pour les journées fraîches.', category: 'Hoodies', collection: 'Atelier', price: 4800, colors: ['Grey', 'Black'], sizes: ['M', 'L', 'XL', 'XXL'], stock: 14, featured: true, images: [unsplash('photo-1551488831-00ddcb6c6bd3'), unsplash('photo-1556821840-3a63f95609a7')] },
  { sku: 'ALC-HD-BLK-002', name: 'Hoodie Essential Black', description: 'Hoodie noir à capuche doublée et cordons ajustables. Sa ligne épurée fonctionne avec denim, cargo ou jogging.', category: 'Hoodies', collection: 'Essentials', price: 4900, colors: ['Black', 'Grey'], sizes: ['S', 'M', 'L', 'XL', 'XXL'], stock: 21, images: [unsplash('photo-1620799140408-edc6dcb6d633'), unsplash('photo-1578681994506-b8f463449011')] },
  { sku: 'ALC-HD-ECR-003', name: 'Hoodie Soft Ecru', description: 'Hoodie écru à la coupe relax avec une texture douce et une allure lumineuse. Idéal pour les superpositions de saison.', category: 'Hoodies', collection: 'Studio', price: 5200, colors: ['Beige', 'White'], sizes: ['S', 'M', 'L', 'XL'], stock: 16, newest: true, label: 'New', images: [unsplash('photo-1618354691373-d851c5c3a990'), unsplash('photo-1556821840-3a63f95609a7')] },
  { sku: 'ALC-HD-RED-004', name: 'Hoodie Signal Red', description: 'Hoodie rouge à la silhouette généreuse avec une poche frontale pratique et des poignets resserrés.', category: 'Hoodies', collection: 'Color Stories', price: 5100, colors: ['Red', 'Black'], sizes: ['M', 'L', 'XL', 'XXL'], stock: 11, images: [unsplash('photo-1556821840-3a63f95609a7'), unsplash('photo-1578681994506-b8f463449011')] },
  { sku: 'ALC-HD-BLU-005', name: 'Hoodie Night Blue', description: 'Hoodie bleu nuit en molleton, avec une coupe confortable et une esthétique sobre inspirée du vestiaire urbain.', category: 'Hoodies', collection: 'Studio', price: 5000, colors: ['Blue', 'Black'], sizes: ['S', 'M', 'L', 'XL'], stock: 13, images: [unsplash('photo-1578681994506-b8f463449011'), unsplash('photo-1620799140408-edc6dcb6d633')] },
  { sku: 'ALC-HD-GRN-006', name: 'Hoodie Moss Green', description: 'Hoodie vert mousse avec une coupe ample et des finitions côtelées. Une pièce forte mais facile à associer.', category: 'Hoodies', collection: 'Color Stories', price: 5100, colors: ['Green', 'Black'], sizes: ['S', 'M', 'L', 'XL'], stock: 12, images: [unsplash('photo-1551488831-00ddcb6c6bd3'), unsplash('photo-1618354691373-d851c5c3a990')] },

  { sku: 'ALC-SW-ECR-001', name: 'Sweat Studio Ecru', description: 'Sweat-shirt écru au col rond, molleton intérieur doux et coupe régulière. Une pièce polyvalente pour les journées fraîches.', category: 'Sweatshirts', collection: 'Studio', price: 4200, colors: ['Beige', 'Grey'], sizes: ['S', 'M', 'L', 'XL', 'XXL'], stock: 18, newest: true, label: 'New', images: [unsplash('photo-1556821840-3a63f95609a7'), unsplash('photo-1620799140408-edc6dcb6d633')] },
  { sku: 'ALC-SW-BLK-002', name: 'Sweat Clean Black', description: 'Sweat noir sans capuche avec épaules nettes, poignets côtelés et une coupe facile à porter au quotidien.', category: 'Sweatshirts', collection: 'Essentials', price: 4100, colors: ['Black', 'Grey'], sizes: ['S', 'M', 'L', 'XL'], stock: 23, images: [unsplash('photo-1618354691373-d851c5c3a990'), unsplash('photo-1551488831-00ddcb6c6bd3')] },
  { sku: 'ALC-SW-RED-003', name: 'Sweat College Red', description: 'Sweat rouge à col rond et allure varsity, avec une construction confortable pour les looks casual.', category: 'Sweatshirts', collection: 'Color Stories', price: 4300, colors: ['Red', 'White'], sizes: ['S', 'M', 'L', 'XL'], stock: 14, label: 'Sale', images: [unsplash('photo-1578587018452-892bacefd3f2'), unsplash('photo-1556821840-3a63f95609a7')] },
  { sku: 'ALC-SW-BLU-004', name: 'Sweat Ocean Blue', description: 'Sweat bleu à la coupe relax, matière douce et lignes minimalistes pour une silhouette moderne.', category: 'Sweatshirts', collection: 'Color Stories', price: 4300, colors: ['Blue', 'White'], sizes: ['S', 'M', 'L', 'XL'], stock: 20, images: [unsplash('photo-1578587018452-892bacefd3f2'), unsplash('photo-1620799140408-edc6dcb6d633')] },
  { sku: 'ALC-SW-GRY-005', name: 'Sweat Heather Grey', description: 'Sweat gris chiné à col rond, avec une coupe droite et un tombé doux qui s’intègre dans toutes les rotations.', category: 'Sweatshirts', collection: 'Essentials', price: 4000, colors: ['Grey', 'Black'], sizes: ['XS', 'S', 'M', 'L', 'XL'], stock: 25, images: [unsplash('photo-1551488831-00ddcb6c6bd3'), unsplash('photo-1578587018452-892bacefd3f2')] },

  { sku: 'ALC-PT-SND-001', name: 'Pantalon Relax Sand', description: 'Pantalon décontracté sable à taille confortable et jambes droites. Sa teinte neutre accompagne les hauts texturés.', category: 'Pants', collection: 'Essentials', price: 3900, colors: ['Beige', 'Black'], sizes: ['S', 'M', 'L', 'XL'], stock: 21, images: [unsplash('photo-1517438476312-10d79c077509'), unsplash('photo-1515886657613-9f3515b0c78f')] },
  { sku: 'ALC-PT-BLK-002', name: 'Pantalon Utility Black', description: 'Pantalon noir d’inspiration utilitaire avec coupe ample, poches fonctionnelles et style urbain.', category: 'Pants', collection: 'Atelier', price: 4500, colors: ['Black', 'Grey'], sizes: ['S', 'M', 'L', 'XL'], stock: 18, images: [unsplash('photo-1515886657613-9f3515b0c78f'), unsplash('photo-1542272604-787c3835535d')] },
  { sku: 'ALC-PT-GRY-003', name: 'Pantalon Wide Grey', description: 'Pantalon gris à jambe large et tombé fluide, pensé pour une silhouette contemporaine et décontractée.', category: 'Pants', collection: 'Studio', price: 4400, colors: ['Grey', 'Black'], sizes: ['S', 'M', 'L', 'XL'], stock: 16, images: [unsplash('photo-1515886657613-9f3515b0c78f'), unsplash('photo-1512436991641-6745cdb1723f')] },
  { sku: 'ALC-PT-GRN-004', name: 'Pantalon Cargo Moss', description: 'Cargo vert mousse avec poches latérales et coupe confortable. Une pièce pratique pour les looks de tous les jours.', category: 'Pants', collection: 'Atelier', price: 4700, colors: ['Green', 'Black'], sizes: ['S', 'M', 'L', 'XL'], stock: 12, newest: true, images: [unsplash('photo-1515886657613-9f3515b0c78f'), unsplash('photo-1542272604-787c3835535d')] },
  { sku: 'ALC-PT-BEI-005', name: 'Pantalon Tailored Beige', description: 'Pantalon beige à ligne plus habillée, poches discrètes et coupe régulière pour passer du quotidien aux sorties.', category: 'Pants', collection: 'Studio', price: 4600, colors: ['Beige', 'Brown'], sizes: ['S', 'M', 'L', 'XL'], stock: 15, images: [unsplash('photo-1515886657613-9f3515b0c78f'), unsplash('photo-1529139574466-a303027c1d8b')] },

  { sku: 'ALC-JN-BLU-001', name: 'Jean Straight Blue', description: 'Jean bleu à coupe droite classique, cinq poches et délavage discret. Une base durable du vestiaire quotidien.', category: 'Jeans', collection: 'Essentials', price: 5200, colors: ['Blue'], sizes: ['28', '30', '32', '34', '36'], stock: 20, featured: true, images: [unsplash('photo-1542272604-787c3835535d'), unsplash('photo-1541099649105-f69ad21f3246')] },
  { sku: 'ALC-JN-BLK-002', name: 'Jean Relax Black', description: 'Jean noir à coupe relax avec une jambe légèrement ample et une finition sobre, facile à porter avec des sneakers.', category: 'Jeans', collection: 'Essentials', price: 5400, colors: ['Black'], sizes: ['28', '30', '32', '34', '36'], stock: 18, images: [unsplash('photo-1541099649105-f69ad21f3246'), unsplash('photo-1515886657613-9f3515b0c78f')] },
  { sku: 'ALC-JN-GRY-003', name: 'Jean Washed Grey', description: 'Jean gris délavé avec une coupe droite et une texture marquée. Il apporte du relief aux tenues monochromes.', category: 'Jeans', collection: 'Studio', price: 5500, colors: ['Grey', 'Black'], sizes: ['28', '30', '32', '34', '36'], stock: 13, newest: true, images: [unsplash('photo-1542272604-787c3835535d'), unsplash('photo-1515886657613-9f3515b0c78f')] },
  { sku: 'ALC-JN-BLU-004', name: 'Jean Loose Indigo', description: 'Jean indigo à volume loose et taille confortable, inspiré des silhouettes streetwear actuelles.', category: 'Jeans', collection: 'Atelier', price: 5800, colors: ['Blue'], sizes: ['28', '30', '32', '34', '36'], stock: 10, label: 'New', images: [unsplash('photo-1541099649105-f69ad21f3246'), unsplash('photo-1542272604-787c3835535d')] },
  { sku: 'ALC-JN-BEI-005', name: 'Jean Ecru Carpenter', description: 'Jean écru à coupe carpenter, poches pratiques et allure workwear légère pour varier du denim classique.', category: 'Jeans', collection: 'Atelier', price: 5900, colors: ['Beige'], sizes: ['28', '30', '32', '34', '36'], stock: 9, images: [unsplash('photo-1515886657613-9f3515b0c78f'), unsplash('photo-1529139574466-a303027c1d8b')] },

  { sku: 'ALC-JK-BLK-001', name: 'Veste Coach Black', description: 'Veste légère noire à col classique, fermeture pressionnée et coupe facile à superposer sur un sweat.', category: 'Jackets', collection: 'Atelier', price: 6800, colors: ['Black', 'Grey'], sizes: ['S', 'M', 'L', 'XL'], stock: 12, featured: true, images: [unsplash('photo-1548883354-7622d03aca27'), unsplash('photo-1551488831-00ddcb6c6bd3')] },
  { sku: 'ALC-JK-BLU-002', name: 'Veste Denim Blue', description: 'Veste en denim bleu à boutons métalliques et poches poitrine. Une couche polyvalente pour les intersaisons.', category: 'Jackets', collection: 'Essentials', price: 7200, colors: ['Blue'], sizes: ['S', 'M', 'L', 'XL'], stock: 14, images: [unsplash('photo-1495105787522-5334e3ffa0ef'), unsplash('photo-1542272604-787c3835535d')] },
  { sku: 'ALC-JK-GRN-003', name: 'Veste Worker Green', description: 'Veste verte d’inspiration workwear avec col net et poches plaquées. Sa coupe reste confortable et facile à porter.', category: 'Jackets', collection: 'Atelier', price: 7000, colors: ['Green', 'Brown'], sizes: ['S', 'M', 'L', 'XL'], stock: 8, newest: true, images: [unsplash('photo-1548883354-7622d03aca27'), unsplash('photo-1515886657613-9f3515b0c78f')] },
  { sku: 'ALC-JK-BEI-004', name: 'Surchemise Utility Beige', description: 'Surchemise beige à poches frontales et volume relax. Elle se porte ouverte sur un t-shirt ou fermée comme une veste légère.', category: 'Jackets', collection: 'Studio', price: 6400, colors: ['Beige', 'Brown'], sizes: ['S', 'M', 'L', 'XL'], stock: 17, images: [unsplash('photo-1529139574466-a303027c1d8b'), unsplash('photo-1495105787522-5334e3ffa0ef')] },
  { sku: 'ALC-JK-RED-005', name: 'Veste Varsity Red', description: 'Veste rouge d’inspiration varsity avec contraste graphique et volume confortable pour une silhouette affirmée.', category: 'Jackets', collection: 'Color Stories', price: 7600, colors: ['Red', 'Black'], sizes: ['S', 'M', 'L', 'XL'], stock: 7, label: 'New', images: [unsplash('photo-1548883354-7622d03aca27'), unsplash('photo-1578587018452-892bacefd3f2')] },

  { sku: 'ALC-SH-WHT-001', name: 'Chemise Oxford White', description: 'Chemise blanche à col classique et coupe régulière, adaptée aux looks habillés comme aux associations plus décontractées.', category: 'Shirts', collection: 'Essentials', price: 4800, colors: ['White', 'Blue'], sizes: ['S', 'M', 'L', 'XL'], stock: 19, featured: true, images: [unsplash('photo-1602810318383-e386cc2a3ccf'), unsplash('photo-1596755094514-f87e34085b2c')] },
  { sku: 'ALC-SH-BLU-002', name: 'Chemise Oxford Blue', description: 'Chemise bleu clair en toile de coton, col boutonné et ligne nette pour composer des tenues faciles toute l’année.', category: 'Shirts', collection: 'Essentials', price: 4900, colors: ['Blue', 'White'], sizes: ['S', 'M', 'L', 'XL'], stock: 15, images: [unsplash('photo-1602810318383-e386cc2a3ccf'), unsplash('photo-1515886657613-9f3515b0c78f')] },
  { sku: 'ALC-SH-BEI-003', name: 'Chemise Overshirt Sand', description: 'Chemise-overshirt sable à coupe ample, pensée pour être portée comme une couche légère sur un t-shirt.', category: 'Shirts', collection: 'Studio', price: 5200, colors: ['Beige', 'Brown'], sizes: ['S', 'M', 'L', 'XL'], stock: 13, newest: true, images: [unsplash('photo-1596755094514-f87e34085b2c'), unsplash('photo-1529139574466-a303027c1d8b')] },
  { sku: 'ALC-SH-GRN-004', name: 'Chemise Flannel Forest', description: 'Chemise à carreaux dans des tons verts et bruns, avec une coupe confortable qui se porte ouverte ou boutonnée.', category: 'Shirts', collection: 'Atelier', price: 5000, colors: ['Green', 'Brown'], sizes: ['S', 'M', 'L', 'XL'], stock: 10, images: [unsplash('photo-1598033129183-c4f50c736f10'), unsplash('photo-1515886657613-9f3515b0c78f')] },
  { sku: 'ALC-SH-BLK-005', name: 'Chemise Poplin Black', description: 'Chemise noire en popeline à col net et coupe droite. Une pièce sobre pour les silhouettes monochromes.', category: 'Shirts', collection: 'Studio', price: 5100, colors: ['Black', 'Grey'], sizes: ['S', 'M', 'L', 'XL'], stock: 11, images: [unsplash('photo-1598033129183-c4f50c736f10'), unsplash('photo-1602810318383-e386cc2a3ccf')] },
  { sku: 'ALC-SH-RED-006', name: 'Chemise Resort Red', description: 'Chemise rouge à col ouvert et coupe fluide, pensée pour apporter une touche expressive aux silhouettes estivales.', category: 'Shirts', collection: 'Color Stories', price: 5300, colors: ['Red', 'White'], sizes: ['S', 'M', 'L', 'XL'], stock: 9, label: 'New', images: [unsplash('photo-1596755094514-f87e34085b2c'), unsplash('photo-1602810318383-e386cc2a3ccf')] },

  { sku: 'ALC-AC-BLK-001', name: 'Casquette Signature Black', description: 'Casquette à six panneaux avec visière courbée et réglage arrière. Un accessoire simple pour finaliser un look urbain.', category: 'Accessories', collection: 'Signature', price: 1800, colors: ['Black'], sizes: ['Unique'], stock: 25, newest: true, label: 'New', images: [unsplash('photo-1521369909029-2afed882baee'), unsplash('photo-1514327605112-b887c0e61c0a')] },
  { sku: 'ALC-AC-BEI-002', name: 'Bonnet Rib Beige', description: 'Bonnet côtelé beige à revers souple, conçu pour ajouter une texture chaleureuse aux tenues de saison.', category: 'Accessories', collection: 'Essentials', price: 1600, colors: ['Beige', 'Brown'], sizes: ['Unique'], stock: 30, images: [unsplash('photo-1576871337622-98d48d1cf531'), unsplash('photo-1521369909029-2afed882baee')] },
  { sku: 'ALC-AC-GRY-003', name: 'Sac Crossbody Grey', description: 'Sac bandoulière gris au format compact, avec une sangle réglable et assez d’espace pour les essentiels du quotidien.', category: 'Accessories', collection: 'Atelier', price: 3200, colors: ['Grey', 'Black'], sizes: ['Unique'], stock: 18, images: [unsplash('photo-1553062407-98eeb64c6a62'), unsplash('photo-1548036328-c9fa89d128fa')] },
  { sku: 'ALC-AC-BRN-004', name: 'Ceinture Canvas Brown', description: 'Ceinture tressée brune à boucle sobre, facile à associer avec un pantalon cargo ou un denim.', category: 'Accessories', collection: 'Essentials', price: 1900, colors: ['Brown', 'Black'], sizes: ['Unique'], stock: 22, images: [unsplash('photo-1624222247344-550fb60583dc'), unsplash('photo-1553062407-98eeb64c6a62')] },
  { sku: 'ALC-AC-WHT-005', name: 'Tote Bag Canvas White', description: 'Tote bag en toile écrue avec anses longues et volume pratique pour accompagner les journées en ville.', category: 'Accessories', collection: 'Signature', price: 1500, colors: ['White', 'Beige'], sizes: ['Unique'], stock: 35, images: [unsplash('photo-1590874103328-eac38a683ce7'), unsplash('photo-1548036328-c9fa89d128fa')] },
  { sku: 'ALC-AC-BLK-006', name: 'Lunettes Frame Black', description: 'Lunettes à monture noire et forme rectangulaire, un accessoire graphique pour compléter une silhouette contemporaine.', category: 'Accessories', collection: 'Signature', price: 2400, colors: ['Black'], sizes: ['Unique'], stock: 16, images: [unsplash('photo-1511499767150-a48a237f0083'), unsplash('photo-1514327605112-b887c0e61c0a')] },
  { sku: 'ALC-AC-RED-007', name: 'Chaussettes Rib Red', description: 'Paire de chaussettes rouges côtelées à hauteur mi-mollet, pensée pour apporter une touche de couleur aux looks casual.', category: 'Accessories', collection: 'Color Stories', price: 900, colors: ['Red', 'White'], sizes: ['Unique'], stock: 40, label: 'Sale', images: [unsplash('photo-1586350977771-b3b0abd50c82'), unsplash('photo-1514327605112-b887c0e61c0a')] },
  { sku: 'ALC-TS-BRN-009', name: 'T-Shirt Clay Brown', description: 'T-shirt brun argile à la coupe régulière, col rond et jersey doux. Une alternative chaleureuse aux neutres classiques.', category: 'T-Shirts', collection: 'Color Stories', price: 2700, colors: ['Brown', 'Beige'], sizes: ['S', 'M', 'L', 'XL'], stock: 14, images: [unsplash('photo-1503342217505-b0a15ec3261c'), unsplash('photo-1515886657613-9f3515b0c78f')] },
  { sku: 'ALC-AC-PNK-008', name: 'Mini Pochette Pink', description: 'Petite pochette rose à porter à la main ou en bandoulière, pratique pour garder les essentiels à portée de main.', category: 'Accessories', collection: 'Color Stories', price: 2200, colors: ['Pink', 'Black'], sizes: ['Unique'], stock: 12, images: [unsplash('photo-1553062407-98eeb64c6a62'), unsplash('photo-1548036328-c9fa89d128fa')] },
]

await connectDatabase()

for (const product of products) {
  await Product.updateOne({ sku: product.sku }, { $set: product }, { upsert: true, runValidators: true })
}

const legacyProduct = await Product.findOne({ name: 'Veste tres belle', sku: { $exists: false } })
if (legacyProduct) {
  await Product.updateOne({ _id: legacyProduct._id }, {
    $set: {
      sku: 'ALC-TS-CRM-010',
      name: 'T-Shirt Cream Essential',
      description: 'T-shirt crème à la coupe droite, col rond et jersey doux. Une base lumineuse et facile à associer au quotidien.',
      category: 'T-Shirts',
      collection: 'Essentials',
      price: 2300,
      salePrice: undefined,
      colors: ['White', 'Beige'],
      sizes: ['S', 'M', 'L', 'XL'],
      stock: 18,
      images: [unsplash('photo-1521572163474-6864f9cf17ab'), unsplash('photo-1515886657613-9f3515b0c78f')],
      active: true,
      label: 'New',
      featured: false,
      newest: true,
    },
    $unset: { salePrice: '', visual: '' },
  }, { runValidators: true })
  console.log('Ancien produit fictif converti en fiche cataloguée ALC-TS-CRM-010')
}

const total = await Product.countDocuments()
const byCategory = await Product.aggregate([{ $match: { active: true } }, { $group: { _id: '$category', count: { $sum: 1 } } }, { $sort: { _id: 1 } }])
console.log(`Seed terminé: ${products.length} SKU gérés, ${total} produits au total`)
console.table(byCategory)
await Product.db.close()
