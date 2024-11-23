export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  media: ProductMedia[];
  category: string;
  inStock?: boolean;
  createdAt: string;
  updatedAt: string;
  sizes?: string[];
}

export interface ProductMedia {
  url: string;
  type: 'image' | 'video';
}

export interface CartItem extends Product {
  quantity: number;
  size?: string;
}