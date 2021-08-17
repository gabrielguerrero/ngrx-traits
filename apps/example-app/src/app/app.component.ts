import { Component } from '@angular/core';

@Component({
  selector: 'ngrx-traits-root',
  template: `<router-outlet></router-outlet>
    <a [routerLink]="'/product-list'"></a> `,
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'example-app';
}
