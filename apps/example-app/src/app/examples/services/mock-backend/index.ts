import { setupWorker } from 'msw';
import { productHandlers } from './product.handler';
import { storeHandlers } from './product-stores.handler';

const worker = setupWorker(...productHandlers, ...storeHandlers);
worker.start({
  onUnhandledRequest: 'warn',
});
console.log('msw started');
export { worker };
