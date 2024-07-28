import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { NavbarComponent } from './components/navbar/navbar.component';
import { SideNavigationComponent } from './components/side-navigation/side-navigation.component';

@Component({
  selector: 'docs-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, SideNavigationComponent],
  template: ` <docs-navbar [(menuOpen)]="menuOpen" />
    <div class="container mx-auto px-8 pt-24">
      <div class="flex">
        <docs-side-navigation class="md:mr-12" [(menuOpen)]="menuOpen" />
        <router-outlet />
      </div>
      <p class="px-8 py-8 text-center text-xs text-zinc-500">
        Copyright © {{ year }} Angular Primitives
      </p>
    </div>`,
})
export class AppComponent {
  readonly year = new Date().getFullYear();

  readonly menuOpen = signal(false);
}
