import { OrderSummary } from '@example-api/shared/models';
import {
  deleteOrder,
  getOrderDetail,
  searchOrders,
  updateOrder,
} from '@example-api/shared/orders.service';
import { http, HttpResponse } from 'msw';

export const ordersHandlers = [
  http.get('/orders', ({ request }) => {
    const url = new URL(request.url);
    const options = {
      search: url.searchParams.get('search'),
      sortColumn: url.searchParams.get('sortColumn'),
      sortAscending: url.searchParams.get('sortAscending'),
      skip: url.searchParams.get('skip'),
      take: url.searchParams.get('take'),
    };
    const response = searchOrders(options);
    return HttpResponse.json(response);
  }),
  http.get('/orders/:id', ({ params }) => {
    const id = params.id as string;
    const orderDetail = getOrderDetail(id);
    return HttpResponse.json(orderDetail);
  }),
  http.put('/orders/:id', async ({ params, request }) => {
    const id = params.id as string;
    const body = (await request.json()) as { status: OrderSummary['status'] };
    const result = updateOrder({ id, changes: body });
    return HttpResponse.json(result);
  }),
  http.delete('/orders/:id', ({ params }) => {
    const id = params.id as string;
    const result = deleteOrder({ id });
    return HttpResponse.json(result);
  }),
];
