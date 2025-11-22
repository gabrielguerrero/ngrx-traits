import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'ngrx-traits-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet />`,
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'example-app';
}
