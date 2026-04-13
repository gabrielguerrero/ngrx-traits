import { setupWorker } from 'msw/browser';

import { branchesHandlers } from './branches.handler';
import { ordersHandlers } from './orders.handler';
import { productHandlers } from './product.handler';
import { userHandlers } from './user.handler';

let worker: ReturnType<typeof setupWorker> | undefined;

// Only initialize MSW in browser environment
if (typeof window !== 'undefined') {
  worker = setupWorker(
    ...productHandlers,
    ...branchesHandlers,
    ...ordersHandlers,
    ...userHandlers,
  );
  worker.start({
    onUnhandledRequest: 'bypass',
  });
  console.log('msw started');
}

export { worker };
