import { RouteMeta } from '@analogjs/router';
import { isPlatformBrowser } from '@angular/common';
import { Component, effect, inject, PLATFORM_ID, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

import { NavbarComponent } from '../components/navbar/navbar.component';
import { SideNavigationComponent } from '../components/side-navigation/side-navigation.component';

@Component({
  selector: 'docs-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, SideNavigationComponent],
  template: ` <div>
    <docs-navbar [(menuOpen)]="menuOpen" class=" bg-white dark:bg-gray-900" />
    <div class="container  mx-auto px-8 pt-24">
      <div class="flex">
        <docs-side-navigation class=" md:mr-12" [(menuOpen)]="menuOpen" />
        <router-outlet />
      </div>
      <p class="px-8 py-8 text-center text-xs text-zinc-500">
        Copyright © {{ year }} Ngrx Traits
      </p>
    </div>
  </div>`,
})
export default class DocsRootComponent {
  private readonly router = inject(Router);
  private readonly platform = inject(PLATFORM_ID);
  readonly year = new Date().getFullYear();

  readonly menuOpen = signal(false);

  constructor() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => this.menuOpen.set(false));

    if (isPlatformBrowser(this.platform)) {
      effect(() => {
        // if the menu is open prevent scrolling on the body
        if (this.menuOpen()) {
          document.body.style.overflow = 'hidden';
        } else {
          document.body.style.overflow = '';
        }
        console.log('AppComponent', this.menuOpen());
      });
    }
  }
}
