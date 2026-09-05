export type Product = {
  productId: number;
  productName: string;
  description: string;
  price: number;
  discount: number;
  specialPrice: number;
  quantity: number;
  image: string;
  category: { categoryId: number; categoryName: string };
  seller: { sellerId: number; username: string } | null;
};

export type ProductRequest = {
  productName: string;
  description: string;
  price: number;
  discount: number;
  specialPrice: number;
  quantity: number;
  image: string;
  categoryId: number;
  sellerId?: number;
};

export type Category = {
  categoryId: number;
  categoryName: string;
};

export type ImageUploadResponse = {
  fileName: string;
  imageUrl: string;
};

export type ProductPage = {
  content: Product[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
};

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  status: number;
  payload: T;
  timestamp: string;
};
