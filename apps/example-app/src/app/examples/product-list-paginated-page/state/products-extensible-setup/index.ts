import * as ProductActions from './products.actions';
import * as ProductSelectors from './products.selectors';
// Use this exported vars outside the state folder only, if you do in files inside
// you could create a circular dependency
export { ProductActions, ProductSelectors };
