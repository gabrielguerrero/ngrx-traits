import { RouteMeta } from '@analogjs/router';
import { isPlatformBrowser } from '@angular/common';
import { Component, effect, inject, PLATFORM_ID, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

import { FooterComponent } from '../components/navbar/footer/footer.component';
import { NavbarComponent } from '../components/navbar/navbar.component';
import { SideNavigationComponent } from '../components/side-navigation/side-navigation.component';

@Component({
  selector: 'docs-root',
  standalone: true,
  imports: [
    RouterOutlet,
    NavbarComponent,
    SideNavigationComponent,
    FooterComponent,
  ],
  template: ` <div>
      <docs-navbar [(menuOpen)]="menuOpen" class=" bg-white dark:bg-gray-900" />
      <div class="container  mx-auto px-8 pt-24">
        <div class="flex">
          <docs-side-navigation class=" md:mr-12" [(menuOpen)]="menuOpen" />
          <router-outlet />
        </div>
      </div>
    </div>
    <div class="flex items-center">
      <docs-footer class="inline-block mx-auto" />
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
      .subscribe(() => {
        this.menuOpen.set(false);
        if (isPlatformBrowser(this.platform)) {
          window?.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth',
          });
        }
      });

    if (isPlatformBrowser(this.platform)) {
      effect(() => {
        // if the menu is open prevent scrolling on the body
        if (this.menuOpen()) {
          document.body.style.overflow = 'hidden';
        } else {
          document.body.style.overflow = '';
        }
      });
    }
  }
}
