export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: 'snes' | 'nes' | 'wii' | 'wiiu' | 'switch' | 'gamecube';
}
export interface Product2 extends Omit<Product, 'id'> {
  id: number;
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

export interface Branch {
  id: number;
  name: string;
  address: string;
}

export interface BranchDetail {
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
export type BranchQuery = {
  search?: string | undefined;
  sortColumn?: keyof Branch | undefined;
  sortAscending?: string | undefined;
  skip?: string | undefined;
  take?: string | undefined;
};
export interface BranchResponse {
  resultList: Branch[];
  total: number;
}

export interface BranchFilter {
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
