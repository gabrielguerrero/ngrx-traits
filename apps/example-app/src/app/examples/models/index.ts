export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
}

export interface ProductFilter {
  search: string;
}
