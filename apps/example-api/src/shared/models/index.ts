export const genreLabelMap = {
  action: 'Action',
  rpg: 'RPG',
  platformer: 'Platformer',
  puzzle: 'Puzzle',
  racing: 'Racing',
  sports: 'Sports',
  fighting: 'Fighting',
  adventure: 'Adventure',
};
export type Genre = keyof typeof genreLabelMap;
export const genres = Object.keys(genreLabelMap) as Genre[];
export const genreOptionsArray = Object.entries(genreLabelMap).map(
  ([id, label]) => ({ id, label }),
) as { id: Genre; label: string }[];
export interface GenreResponse {
  resultList: { id: Genre; label: string }[];
  total: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  genre: Genre;
  console: Console;
  categoryId?: string;
}
export const consoleLabelMap = {
  snes: 'Super Nintendo',
  nes: 'NES',
  gamecube: 'GameCube',
  n64: 'Nintendo 64',
};
export type Console = keyof typeof consoleLabelMap;
export const consoles = Object.keys(consoleLabelMap) as Console[];
export const consoleOptionsArray = Object.entries(consoleLabelMap).map(
  ([id, label]) => ({ id, label }),
) as { id: Console; label: string }[];

export interface ProductOrder extends Product {
  quantity?: number;
}
export const orderStatusMap = {
  pending: 'Pending',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export type OrderStatus = keyof typeof orderStatusMap;

export const orderStatusArray = Object.entries(orderStatusMap).map(
  ([key, value]) => ({
    id: key,
    label: value,
  }),
) as { id: OrderStatus; label: string }[];

export interface OrderSummary {
  id: string;
  userName: string;
  userEmail: string;
  total: number;
  date: string;
  status: OrderStatus;
}
export interface OrderDetail extends OrderSummary {
  items: ProductOrder[];
  notes?: string;
  deliveryAddress: {
    line1: string;
    postCode: string;
    country: string;
    town: string;
  };
}
export type OrderQuery = {
  search?: string | undefined;
  sortColumn?: keyof Branch | undefined;
  sortAscending?: string | undefined;
  skip?: string | undefined;
  take?: string | undefined;
};
export interface OrderResponse {
  resultList: OrderSummary[];
  total: number;
}
export interface ProductFilter {
  search: string;
}

export interface ProductDetail extends Product {
  maker: string;
  releaseDate: string;
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
