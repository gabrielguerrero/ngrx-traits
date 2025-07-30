
import { Component } from '@angular/core';

import { ProductsBranchDropdownComponent } from './products-branch-dropdown.component';
import { ProductsBranchStore } from './products-branch.store';

@Component({
  selector: 'infinite-scroll-page',
  standalone: true,
  imports: [ProductsBranchDropdownComponent],
  template: `<products-branch-dropdown />`,
  styles: ``,
  providers: [ProductsBranchStore],
})
export class InfiniteScrollPageComponent {}
