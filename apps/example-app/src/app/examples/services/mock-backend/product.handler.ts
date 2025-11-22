import { Category } from '@example-api/shared/models';
import {
  getProductDetail,
  processCheckout,
  searchProducts,
} from '@example-api/shared/product.service';
import { http, HttpResponse } from 'msw';

export const productHandlers = [
  http.post('/api/checkout', () => {
    const orderId = processCheckout();
    return HttpResponse.json(orderId);
  }),
  http.get('/api/products/:id', ({ params }) => {
    const id = params.id as string;
    const productDetail = getProductDetail(id);
    return HttpResponse.json(productDetail);
  }),
  http.get('/api/products', ({ request }) => {
    const url = new URL(request.url);
    const options = {
      search: url.searchParams.get('search'),
      sortColumn: url.searchParams.get('sortColumn'),
      sortAscending: url.searchParams.get('sortAscending'),
      category: url.searchParams.get('category') as Category,
      skip: url.searchParams.get('skip'),
      take: url.searchParams.get('take'),
    };
    const response = searchProducts(options);
    return HttpResponse.json(response);
  }),
];
