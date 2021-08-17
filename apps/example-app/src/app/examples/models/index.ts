export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
}
export interface ProductOrder extends Product {
  quantity?: number;
}
export interface ProductFilter {
  search: string;
}

export interface ProductDetail extends Product {
  maker: string;
  releaseDate: string;
  image: string;
}
