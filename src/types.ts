export interface ProductDetails {
  fullDescription?: string;
  differentiators?: string[];
  technicalSpecs?: Record<string, string>;
  packageContents?: string[];
  careInstructions?: string[];
}

export interface Product {
  id: string;
  name: string;
  category: string;
  brand?: string;
  tag: string;
  description: string;
  price: number;
  image: string;
  badge?: string;
  details?: ProductDetails;
  isCustomAdded?: boolean;
  createdAt?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
