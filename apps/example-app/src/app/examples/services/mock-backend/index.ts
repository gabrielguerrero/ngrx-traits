import { setupWorker } from 'msw';

import { branchesHandlers } from './branches.handler';
import { productHandlers } from './product.handler';

const worker = setupWorker(...productHandlers, ...branchesHandlers);
worker.start({
  onUnhandledRequest: 'bypass',
});
console.log('msw started');
export { worker };
