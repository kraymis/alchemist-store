export interface CustomizationState {
  productType: 'custom-tshirt';
  color: string;
  front: unknown;
  back: unknown;
  frontPreview?: string;
  backPreview?: string;
  frontDesignImage?: string;
  backDesignImage?: string;
  designFiles?: Array<{
    role?: string;
    url: string;
    path?: string;
    fileName?: string;
    originalName?: string;
    mimeType?: string;
    size?: number;
  }>;
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image?: string;
  visual?: string;
  size?: string;
  color?: string;
  quantity: number;
  customized?: boolean;
  customization?: CustomizationState;
}

export interface CustomizedTShirtItem extends CartItem {
  customized: true;
  customization: CustomizationState;
}

export interface CustomerInfo {
  fullName: string;
  phone: string;
  email?: string;
  wilaya: string;
  communeAddress: string;
  notes?: string;
}

export interface Order {
  id: string;
  createdAt: string;
  customer: CustomerInfo;
  items: CartItem[];
  subtotal: number;
  total: number;
}
