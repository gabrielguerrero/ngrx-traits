import { images, mockProducts } from './mock-data';
import { Category, Product, ProductDetail } from './models';
import { sortData } from './sort-entities.utils';
import { getRandomInteger } from './utils';

export interface SearchProductsOptions {
  search?: string | null;
  sortColumn?: string | null;
  sortAscending?: string | null;
  category?: Category | null;
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

  // Filter by category
  if (options?.category) {
    const description =
      options.category === 'snes'
        ? 'Super Nintendo Game'
        : options.category === 'gamecube'
          ? 'GameCube Game'
          : '';
    result = result.filter((entity) => entity.description === description);
  }

  const total = result.length;

  // Apply pagination
  if (options?.skip || options?.take) {
    const skip = +(options?.skip ?? 0);
    const take = +(options?.take ?? 0);
    result = result.slice(skip, skip + take);
  }

  // Apply sorting
  if (options?.sortColumn) {
    result = sortData(result, {
      active: options.sortColumn as any,
      direction: options.sortAscending === 'true' ? 'asc' : 'desc',
    });
  }

  return { resultList: result, total };
}

/**
 * Get product detail by ID
 */
export function getProductDetail(id: string): ProductDetail | null {
  const product = mockProducts.find((p) => p.id === id);

  if (!product) {
    return null;
  }

  return {
    ...product,
    id: product.id,
    image: 'assets/' + images[+product.id % 6],
    maker: 'Nintendo',
    releaseDate: '' + getRandomInteger(1990, 2000),
  } as ProductDetail;
}

/**
 * Process checkout (stub implementation)
 */
export function processCheckout(): string {
  return '123'; // Order ID
}
