
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';

import { ProductsBranchDropdownComponent } from './products-branch-dropdown.component';
import { ProductsBranchStore } from './products-branch.store';

@Component({
  selector: 'infinite-scroll-page',
  standalone: true,
  imports: [
    ProductsBranchDropdownComponent,
    MatCardModule,
    MatButtonModule,
    RouterLink,
  ],
  template: `
    <a mat-raised-button routerLink="/signals" class="mb-4">Back to Examples</a>
    <mat-card>
      <mat-card-header>
        <mat-card-title>Infinite Scroll Example</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <products-branch-dropdown />
      </mat-card-content>
    </mat-card>
  `,
  styles: ``,
  providers: [ProductsBranchStore],
})
export class InfiniteScrollPageComponent {}
