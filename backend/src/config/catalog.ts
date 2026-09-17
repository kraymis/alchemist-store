export const PRODUCT_CATEGORIES = ['T-Shirts', 'Hoodies', 'Sweatshirts', 'Pants', 'Jackets', 'Accessories'] as const
export const PRODUCT_COLORS = [
  { name: 'Black', hex: '#000000' }, { name: 'White', hex: '#FFFFFF' }, { name: 'Red', hex: '#DC2626' },
  { name: 'Blue', hex: '#2563EB' }, { name: 'Green', hex: '#16803C' }, { name: 'Yellow', hex: '#EAB308' },
  { name: 'Orange', hex: '#EA580C' }, { name: 'Pink', hex: '#EC4899' }, { name: 'Purple', hex: '#7C3AED' },
  { name: 'Brown', hex: '#78350F' }, { name: 'Beige', hex: '#D6C5A5' }, { name: 'Grey', hex: '#6B7280' },
] as const
const categoryAliases: Record<string, typeof PRODUCT_CATEGORIES[number]> = { 't-shirts': 'T-Shirts', 't-shirt': 'T-Shirts', tshirts: 'T-Shirts', tshirt: 'T-Shirts', hoodies: 'Hoodies', sweatshirts: 'Sweatshirts', pants: 'Pants', jackets: 'Jackets', accessories: 'Accessories' }
const colorAliases = Object.fromEntries(PRODUCT_COLORS.map(({ name }) => [name.toLowerCase(), name]))
export const normalizeCategory = (value: unknown) => categoryAliases[String(value || '').trim().toLowerCase()] || null
export const normalizeColor = (value: unknown) => colorAliases[String(value || '').trim().toLowerCase()] || null
