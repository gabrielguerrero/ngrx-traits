import { mockProducts } from './mock-data';
import { Console, Product, ProductDetail } from './models';
import { sortData } from './sort-entities.utils';
import { getRandomInteger } from './utils';

export interface SearchProductsOptions {
  search?: string | null;
  sortColumn?: string | null;
  sortAscending?: string | null;
  category?: Console | null;
  skip?: string | null;
  take?: string | null;
}

export interface ProductsResponse {
  resultList: Product[];
  total: number;
}

/**
 * Search and filter products based on provided options
 */
export function searchProducts(
  options: SearchProductsOptions,
): ProductsResponse {
  let result = [...mockProducts];

  // Filter by search term
  if (options?.search) {
    result = result.filter((entity) =>
      entity.name.toLowerCase().includes(options.search!.toLowerCase()),
    );
  }

  // Filter by category (console)
  if (options?.category) {
    result = result.filter((entity) => entity.console === options.category);
  }

  const total = result.length;

  // Apply sorting
  if (options?.sortColumn) {
    result = sortData(result, {
      active: options.sortColumn as any,
      direction: options.sortAscending === 'true' ? 'asc' : 'desc',
    });
  }

  // Apply pagination
  if (options?.skip || options?.take) {
    const skip = +(options?.skip ?? 0);
    const take = +(options?.take ?? 0);
    result = result.slice(skip, skip + take);
  }

  return { resultList: result, total };
}

/**
 * Get product detail by ID
 */
export function getProductDetail(id: string): ProductDetail | null {
  const product = mockProducts.find((p) => p.id === id) as
    | Partial<ProductDetail>
    | undefined;

  if (!product) {
    return null;
  }

  // maker and release date are not part of the list data, so they are made up
  // on first read — but kept once a product has been saved with them
  return {
    ...(product as ProductDetail),
    maker: product.maker || 'Nintendo',
    releaseDate: product.releaseDate || '' + getRandomInteger(1990, 2000),
  };
}

/**
 * Create a product, returning its detail with the id it was given
 */
export function createProduct(changes: Partial<Product>): ProductDetail {
  const nextId =
    mockProducts.reduce((max, p) => Math.max(max, Number(p.id)), -1) + 1;
  const product: Product = {
    name: '',
    description: '',
    price: 0,
    image: '',
    genre: 'action',
    console: 'snes',
    ...changes,
    id: String(nextId),
  };
  mockProducts.push(product);

  return getProductDetail(product.id) as ProductDetail;
}

/**
 * Update a product by ID, returning the updated detail
 */
export function updateProduct(params: {
  id: string;
  changes: Partial<Product>;
}): ProductDetail | null {
  const product = mockProducts.find((p) => p.id === params.id);

  if (!product) {
    return null;
  }
  Object.assign(product, params.changes, { id: product.id });

  return getProductDetail(params.id);
}

/**
 * Process checkout (stub implementation)
 */
export function processCheckout(): string {
  return '123'; // Order ID
}
