import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  model,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import '@docsearch/css';
import docsearch from '@docsearch/js';
import {
  bootstrapDiscord,
  bootstrapGithub,
  bootstrapList,
  bootstrapMedium,
} from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';

import { ThemeToggleComponent } from '../theme-toggle/theme-toggle.component';

@Component({
  selector: 'docs-navbar',
  standalone: true,
  imports: [MatIconButton, NgIcon, ThemeToggleComponent],
  viewProviders: [
    provideIcons({
      bootstrapGithub,
      bootstrapDiscord,
      bootstrapMedium,
      bootstrapList,
    }),
  ],
  template: ` <header
    class="fixed z-50 bg-white/70 dark:bg-gray-950/60 backdrop-blur-md top-0 z-20 h-16 w-full border-b border-black/10 dark:border-blue-950 "
  >
    <div
      class="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-[#AA1BB6] to-[#452070]"
    ></div>
    <nav
      class="container relative mx-auto flex h-full w-full items-center gap-x-2 px-4 sm:gap-x-4 sm:px-8"
    >
      <button
        mat-icon-button
        type="button"
        class="shrink-0 md:!hidden dark:!text-zinc-300"
        aria-label="Toggle navigation menu"
        (click)="toggle()"
      >
        <ng-icon class="text-2xl" name="bootstrapList" aria-hidden="true" />
      </button>

      <!-- picture so each viewport downloads only the logo it shows -->
      <a class="shrink-0" href="/"
        ><picture>
          <source
            media="(min-width: 768px)"
            srcset="logo.svg"
            width="165"
            height="32" />
          <img
            class="block h-8 w-auto"
            src="logo-small.webp"
            width="32"
            height="32"
            alt="NgRx Traits" /></picture
      ></a>
      <a
        class="inline-flex shrink-0 items-center justify-center gap-x-2 rounded-lg dark:text-zinc-300 px-2 sm:px-3 py-2 outline-none transition-colors "
        href="/docs/getting-started/what-is-ngrx-traits"
      >
        <span class="font-medium md:inline">Docs</span>
      </a>
      <div class="ml-auto inline-flex min-w-0 items-center gap-x-1 sm:gap-x-2">
        <a
          class="hidden sm:inline-flex items-center justify-center gap-x-2 rounded-lg  px-3 py-2 outline-none transition-colors  focus-visible:text-zinc-800 focus-visible:ring-2 focus-visible:ring-blue-500 active:bg-zinc-100 "
          target="_blank"
          href="https://medium.com/@gabrieldavidguerrero"
          aria-label="Medium"
        >
          <ng-icon
            class="text-lg text-zinc-500 dark:text-zinc-300 "
            name="bootstrapMedium"
            aria-hidden="true"
          />
          <span class="hidden font-medium md:inline dark:text-zinc-300"
            >Medium</span
          >
        </a>
        <a
          class="hidden sm:inline-flex items-center justify-center gap-x-2 rounded-lg dark:text-zinc-300 px-3 py-2 outline-none transition-colors focus-visible:text-zinc-800 focus-visible:ring-2 focus-visible:ring-blue-500 active:bg-zinc-100"
          target="_blank"
          href="https://discord.gg/CEjF5D3NCh"
          aria-label="Discord"
        >
          <ng-icon
            class="text-lg text-zinc-500 dark:text-zinc-300"
            name="bootstrapDiscord"
            aria-hidden="true"
          />
          <span class="hidden font-medium md:inline">Discord</span>
        </a>
        <a
          class="inline-flex items-center dark:text-zinc-300 justify-center gap-x-2 rounded-lg px-2 sm:px-3 py-2 outline-none transition-colors focus-visible:text-zinc-800 focus-visible:ring-2 focus-visible:ring-blue-500 active:bg-zinc-100"
          target="_blank"
          href="https://github.com/gabrielguerrero/ngrx-traits"
          aria-label="GitHub"
        >
          <ng-icon class="text-lg" name="bootstrapGithub" aria-hidden="true" />
          <span class="hidden font-medium sm:inline">GitHub</span>
        </a>
        <docs-theme-toggle />
        <div id="docsearch"></div>
      </div>
    </nav>
  </header>`,
  styles: `
    ::ng-deep #docsearch {
      .DocSearch-Button {
        position: unset;
        border: 1px solid #d4d4d8;
        width: 150px !important;
      }
    }

    /* docsearch already hides the placeholder and keys up to 768px, drop the
       fixed width there too so the button collapses to its icon and the nav
       fits on phones */
    @media (max-width: 768px) {
      ::ng-deep #docsearch .DocSearch-Button {
        width: auto !important;
        margin: 0;
        padding: 0 10px;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent implements OnInit {
  readonly menuOpen = model(false);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly appId = import.meta.env['VITE_DOC_SEARCH_APP_ID'];
  private readonly apiKey = import.meta.env['VITE_DOC_SEARCH_API_KEY'];

  ngOnInit() {
    // docsearch reaches for window as soon as it is called, and there is no
    // search box to render on the server anyway
    if (!this.isBrowser) return;

    docsearch({
      container: '#docsearch',
      appId: this.appId,
      indexName: 'ngrx-traits',
      apiKey: this.apiKey,
    });
  }

  toggle(): void {
    this.menuOpen.update((open) => !open);
  }
}
