import { Component } from '@angular/core';

@Component({
  selector: 'ngrx-traits-root',
  standalone: false,
  template: `<router-outlet />`,
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'example-app';
}
