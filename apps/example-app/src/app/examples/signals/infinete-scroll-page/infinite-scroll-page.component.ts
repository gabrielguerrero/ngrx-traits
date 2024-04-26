import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

import { ProductsBranchDropdownComponent } from './products-branch-dropdown.component';
import { ProductsBranchListComponent } from './products-branch-list.component';
import { ProductsBranchStore } from './products-branch.store';

@Component({
  selector: 'infinite-scroll-page',
  standalone: true,
  imports: [
    CommonModule,
    ProductsBranchDropdownComponent,
    ProductsBranchListComponent,
  ],
  template: `<products-branch-dropdown />`,
  styles: ``,
  providers: [ProductsBranchStore],
})
export class InfiniteScrollPageComponent {}
