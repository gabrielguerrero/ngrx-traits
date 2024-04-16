import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

import { ProductsBranchDropdownComponent } from './components/products-branch-dropdown/products-branch-dropdown.component';

@Component({
  selector: 'infinite-scroll-page',
  standalone: true,
  imports: [CommonModule, ProductsBranchDropdownComponent],
  template: `<products-branch-dropdown />`,
  styles: ``,
})
export class InfiniteScrollPageComponent {}
