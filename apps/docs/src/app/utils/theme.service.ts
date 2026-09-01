import { isPlatformBrowser } from '@angular/common';
import { effect, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'ngrx-traits-theme';

/**
 * Keeps the `dark` class and `data-theme` attribute on <html> in sync with the
 * selected theme, and persists the choice in localStorage. The initial value is
 * applied by the inline script in index.html to avoid a flash of the wrong
 * theme, this service just reads back what that script decided.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly theme = signal<Theme>('dark');

  constructor() {
    if (!this.isBrowser) return;

    this.theme.set(
      document.documentElement.classList.contains('dark') ? 'dark' : 'light',
    );

    effect(() => this.apply(this.theme()));
  }

  toggle(): void {
    this.theme.update((theme) => (theme === 'dark' ? 'light' : 'dark'));
    this.persist(this.theme());
  }

  private apply(theme: Theme): void {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.setAttribute('data-theme', theme);
  }

  /**
   * Only an explicit toggle is stored, persisting the value derived from
   * prefers-color-scheme would pin the visitor to whatever their os said on
   * their first visit.
   */
  private persist(theme: Theme): void {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // storage can be unavailable (private mode), theme still applies
    }
  }
}
