import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'docs-navbar',
  standalone: true,
  imports: [MatIconButton, MatIcon],
  template: ` <header
    class="fixed top-0 z-20 h-16 w-full border-b border-black/10 bg-white"
  >
    <div
      class="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-[#E90364] to-[#FA2C05]"
    ></div>
    <nav
      class="container relative mx-auto flex h-full w-full items-center gap-x-4 px-8"
    >
      <button mat-icon-button class="md:!hidden" (click)="toggle()">
        <mat-icon>menu</mat-icon>
      </button>

      <!--        <img class="hidden h-8 w-auto md:block" src="assets/logo.svg" alt="Angular Primitives" />-->
      <!--        <img class="block h-8 w-auto md:hidden" src="assets/logo-small.svg" alt="Angular Primitives" />-->

      <!--        <div id="docsearch"></div>-->

      <div class="ml-auto inline-flex gap-x-2">
        <a
          class="inline-flex items-center justify-center gap-x-2 rounded-lg bg-white px-3 py-2 outline-none transition-colors hover:bg-zinc-50 hover:text-zinc-800 focus-visible:text-zinc-800 focus-visible:ring-2 focus-visible:ring-blue-500 active:bg-zinc-100"
          target="_blank"
          href="https://github.com/ng-primitives/ng-primitives/"
        >
          <!--            <ng-icon class="text-lg" name="bootstrapGithub" />-->
          <span class="hidden font-medium sm:inline">GitHub</span>
        </a>
      </div>
    </nav>
  </header>`,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent {
  readonly menuOpen = model(false);

  toggle(): void {
    this.menuOpen.update((open) => !open);
  }
}
