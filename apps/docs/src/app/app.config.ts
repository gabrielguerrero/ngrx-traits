import { provideContent, withMarkdownRenderer } from '@analogjs/content';
import { withPrismHighlighter } from '@analogjs/content/prism-highlighter';
import { provideFileRouter } from '@analogjs/router';
import { isPlatformBrowser, provideImgixLoader } from '@angular/common';
import { provideHttpClient, withFetch } from '@angular/common/http';
import {
  APP_INITIALIZER,
  ApplicationConfig,
  inject,
  Injector,
  PLATFORM_ID,
  provideAppInitializer,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';

import { TabGroupComponent } from './components/tab-group/tab-group.component';
import { TabComponent } from './components/tab/tab.component';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideFileRouter(),
    provideClientHydration(),
    provideContent(withMarkdownRenderer(), withPrismHighlighter()),
    provideHttpClient(withFetch()),
    provideAppInitializer(initializeCustomElements),
    provideImgixLoader('https://gabrielguerrerosite-914026926.imgix.net/'),
  ],
};

export async function initializeCustomElements() {
  const injector = inject(Injector);
  const platform = inject(PLATFORM_ID);
  if (isPlatformBrowser(platform)) {
    const { createCustomElement } = await import('@angular/elements');
    // Register the custom element with the browser.

    customElements.define(
      'tab-group',
      createCustomElement(TabGroupComponent, { injector }),
    );
    customElements.define(
      'tab-item',
      createCustomElement(TabComponent, { injector }),
    );
  }
}
