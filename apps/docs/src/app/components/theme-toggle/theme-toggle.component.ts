import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { ThemeService } from '../../utils/theme.service';

@Component({
  selector: 'docs-theme-toggle',
  standalone: true,
  template: `<button
    type="button"
    class="inline-flex items-center justify-center rounded-lg px-3 py-2 text-zinc-500 outline-none transition-colors hover:text-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-zinc-300"
    title="Toggle light/dark theme"
    aria-label="Toggle light/dark theme"
    (click)="theme.toggle()"
  >
    <!-- moon, shown on light theme (click switches to dark) -->
    <svg
      class="icon-moon h-[18px] w-[18px]"
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        d="M6 .278a.768.768 0 0 1 .08.858 7.208 7.208 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.055 1.533-.16a.787.787 0 0 1 .81.316.733.733 0 0 1-.031.893A8.349 8.349 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.752.752 0 0 1 6 .278Z"
      />
    </svg>
    <!-- sun, shown on dark theme (click switches to light) -->
    <svg
      class="icon-sun h-[18px] w-[18px]"
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        d="M8 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6Zm0 1a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0Zm0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13Zm8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5ZM3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8Zm10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0Zm-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0Zm9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707ZM4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708Z"
      />
    </svg>
  </button>`,
  // toggled with css rather than a signal so the server rendered markup stays
  // valid whatever theme the browser picks before hydration
  styles: `
    .icon-sun {
      display: none;
    }

    :host-context(html.dark) .icon-sun {
      display: block;
    }

    :host-context(html.dark) .icon-moon {
      display: none;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeToggleComponent {
  protected readonly theme = inject(ThemeService);
}
