import {
  ChangeDetectionStrategy,
  Component,
  model,
  OnInit,
} from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import '@docsearch/css';
import '@docsearch/css';
import docsearch from '@docsearch/js';
import {
  bootstrapDiscord,
  bootstrapGithub,
  bootstrapMedium,
} from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';

@Component({
  selector: 'docs-navbar',
  standalone: true,
  imports: [MatIconButton, MatIcon, NgIcon],
  viewProviders: [
    provideIcons({ bootstrapGithub, bootstrapDiscord, bootstrapMedium }),
  ],
  template: ` <header
    class="fixed z-50 bg-white dark:bg-gray-950  top-0 z-20 h-16 w-full border-b border-black/10 dark:border-blue-950 "
  >
    <div
      class="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-[#AA1BB6] to-[#452070]"
    ></div>
    <nav
      class="container relative mx-auto flex h-full w-full items-center gap-x-4 px-8"
    >
      <button
        mat-icon-button
        type="button"
        class="md:!hidden dark:!text-zinc-300"
        (click)="toggle()"
      >
        <mat-icon>menu</mat-icon>
      </button>

      <a href="/"
        ><img
          class="hidden h-8 w-auto md:block"
          src="logo.svg"
          alt="Ngrx Traits" />
        <img
          class="block h-8 w-auto md:hidden"
          src="logo-small.svg"
          alt="Ngrx Traits"
      /></a>
      <a
        class="inline-flex items-center justify-center gap-x-2 rounded-lg dark:text-zinc-300 px-3 py-2 outline-none transition-colors "
        href="/docs/getting-started/what-is-ngrx-traits"
      >
        <span class="font-medium md:inline">Docs</span>
      </a>
      <div class="ml-auto inline-flex gap-x-2 ">
        <a
          class="inline-flex items-center justify-center gap-x-2 rounded-lg  px-3 py-2 outline-none transition-colors  focus-visible:text-zinc-800 focus-visible:ring-2 focus-visible:ring-blue-500 active:bg-zinc-100 "
          target="_blank"
          href="https://medium.com/@gabrieldavidguerrero"
        >
          <ng-icon
            class="text-lg text-zinc-500 dark:text-zinc-300 "
            name="bootstrapMedium"
          />
          <span class="hidden font-medium md:inline dark:text-zinc-300"
            >Medium</span
          >
        </a>
        <a
          class="inline-flex items-center justify-center gap-x-2 rounded-lg dark:text-zinc-300 px-3 py-2 outline-none transition-colors focus-visible:text-zinc-800 focus-visible:ring-2 focus-visible:ring-blue-500 active:bg-zinc-100"
          target="_blank"
          href="https://discord.gg/CEjF5D3NCh"
        >
          <ng-icon
            class="text-lg text-zinc-500 dark:text-zinc-300"
            name="bootstrapDiscord"
          />
          <span class="hidden font-medium md:inline">Discord</span>
        </a>
        <a
          class="inline-flex items-center dark:text-zinc-300 justify-center gap-x-2 rounded-lg px-3 py-2 outline-none transition-colors focus-visible:text-zinc-800 focus-visible:ring-2 focus-visible:ring-blue-500 active:bg-zinc-100"
          target="_blank"
          href="https://github.com/gabrielguerrero/ngrx-traits"
        >
          <ng-icon class="text-lg" name="bootstrapGithub" />
          <span class="hidden font-medium sm:inline">GitHub</span>
        </a>
        <div id="docsearch" data-theme="dark"></div>
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
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent implements OnInit {
  readonly menuOpen = model(false);
  private readonly appId = import.meta.env['VITE_DOC_SEARCH_APP_ID'];
  private readonly apiKey = import.meta.env['VITE_DOC_SEARCH_API_KEY'];
  ngOnInit() {
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
