import { RouteMeta } from '@analogjs/router';
import { isPlatformBrowser } from '@angular/common';
import {
  Component,
  effect,
  inject,
  PLATFORM_ID,
  signal,
  viewChild,
} from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

import { FooterComponent } from '../components/navbar/footer/footer.component';
import { NavbarComponent } from '../components/navbar/navbar.component';
import {
  PageTocComponent,
  scrollBehavior,
} from '../components/page-toc/page-toc.component';
import { SideNavigationComponent } from '../components/side-navigation/side-navigation.component';

@Component({
  selector: 'docs-root',
  standalone: true,
  imports: [
    RouterOutlet,
    NavbarComponent,
    SideNavigationComponent,
    PageTocComponent,
    FooterComponent,
  ],
  template: ` <div>
      <docs-navbar [(menuOpen)]="menuOpen" class=" bg-white dark:bg-gray-900" />
      <div class="container  mx-auto px-8 pt-24">
        <div class="flex" #docsBody>
          <docs-side-navigation class=" md:mr-12" [(menuOpen)]="menuOpen" />
          <router-outlet />
          <docs-page-toc class="xl:ml-10" [container]="docsBody" />
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

  private readonly toc = viewChild(PageTocComponent);
  /** url of the current page without its #fragment */
  private pagePath: string | null = null;

  constructor() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.menuOpen.set(false);
        if (isPlatformBrowser(this.platform)) this.scrollOnNavigation(event);
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

  private scrollOnNavigation(event: NavigationEnd): void {
    const url = this.router.parseUrl(event.urlAfterRedirects);
    const fragment = url.fragment;
    url.fragment = null;
    const path = this.router.serializeUrl(url);
    const previousPath = this.pagePath;
    this.pagePath = path;

    // first load: the page toc follows any #fragment once headings render
    if (event.id === 1) return;

    // same page (toc or side-nav #section link, back/forward between sections)
    if (path === previousPath && fragment && this.toc()?.jumpTo(fragment))
      return;

    // new page: go to the top; with a #fragment the toc jumps to it once the
    // new headings render, so do not leave a smooth scroll running into it
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: fragment ? 'auto' : scrollBehavior(),
    });
  }
}
