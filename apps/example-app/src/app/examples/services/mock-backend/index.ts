import { setupWorker } from 'msw';

import { branchesHandlers } from './branches.handler';
import { ordersHandlers } from './orders.handler';
import { productHandlers } from './product.handler';

const worker = setupWorker(
  ...productHandlers,
  ...branchesHandlers,
  ...ordersHandlers,
);
worker.start({
  onUnhandledRequest: 'bypass',
});
console.log('msw started');
export { worker };
