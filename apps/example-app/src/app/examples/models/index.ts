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

export interface ProductsStore {
  id: number;
  name: string;
  address: string;
}

export interface ProductsStoreDetail {
  id: number;
  name: string;
  phone: string;
  address: {
    line1: string;
    postCode: string;
    town: string;
    country: string;
  };
  manager: string;
  departments: Department[];
}
export type ProductsStoreQuery = {
  search?: string | undefined;
  sortColumn?: keyof ProductsStore | undefined;
  sortAscending?: string | undefined;
  skip?: string | undefined;
  take?: string | undefined;
};
export interface ProductsStoreResponse {
  resultList: ProductsStore[];
  total: number;
}

export interface ProductsStoreFilter {
  search?: string;
}

export interface Department {
  id: number;
  name: string;
}

export interface DepartmentFilter {
  storeId: number;
  search?: string;
}
