import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'docs-side-navigation',
  standalone: true,
  imports: [NgTemplateOutlet, RouterLink, RouterLinkActive],
  template: ` <ng-template #content>
      <div
        class="sticky top-24 flex h-[calc(100dvh-140px)] w-full flex-col gap-y-4 overflow-auto overscroll-contain md:h-max md:overflow-visible"
      >
        @for (section of sections; track section.title) {
          <div>
            <h2 class=" mb-2 inline-block text-xl font-medium app-title-color">
              {{ section.title }}
            </h2>
            <ul class="ml-1">
              @for (link of section.links; track link) {
                <li class="text-zinc-600 dark:text-zinc-300 text-sm">
                  @if (link.external) {
                    <a
                      class="flex h-8 items-center  px-4 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 hover:text-blue-500"
                      [href]="link.link"
                      routerLinkActive="text-sm font-medium text-blue-400 "
                    >
                      {{ link.name }}
                    </a>
                  } @else {
                    <a
                      class="flex h-8 items-center rounded-lg px-4 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 hover:text-blue-500"
                      [routerLink]="link.link"
                      routerLinkActive="text-sm font-medium text-[#629ef8] "
                    >
                      {{ link.name }}
                    </a>
                  }
                </li>
              }
            </ul>
          </div>
        }
        <h2
          class=" inline-block  bg-clip-text text-xl font-medium app-title-color"
        >
          Store Features
        </h2>
        @for (section of storeFeatures; track section.title) {
          <div class="ml-4">
            <h2
              class="text-md mb-2 font-semibold text-zinc-600 dark:text-white"
            >
              {{ section.title }}
            </h2>
            <ul class="ml-1">
              @for (link of section.links; track link) {
                <li class="text-zinc-600 dark:text-zinc-300 text-sm">
                  @if (link.external) {
                    <a
                      class="flex h-8 items-center  px-4 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 hover:text-blue-500"
                      [href]="link.link"
                      routerLinkActive="text-sm font-medium text-blue-400 "
                    >
                      {{ link.name }}
                    </a>
                  } @else {
                    <a
                      class="flex h-8 items-center  px-4 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 hover:text-blue-500"
                      [routerLink]="link.link"
                      routerLinkActive="text-sm font-medium text-blue-400 "
                    >
                      {{ link.name }}
                    </a>
                  }
                </li>
              }
            </ul>
          </div>
        }
        <h2 class=" mb-2 inline-block text-xl font-medium app-title-color">
          <a
            class="flex h-8 items-center rounded-lg px-4 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 hover:text-blue-500"
            routerLink="/docs/other/support"
            routerLinkActive="font-medium text-[#629ef8] "
          >
            Support
          </a>
        </h2>
      </div>
    </ng-template>
    @if (menuOpen()) {
      <div class="fixed inset-0 z-10 bg-black/50" (click)="menuOpen.set(false)">
        <div
          class="h-full w-85 max-w-full bg-white px-10 shadow-xl bg-white dark:bg-gray-900"
          (click)="$event.stopPropagation()"
        >
          <ng-container [ngTemplateOutlet]="content" />
        </div>
      </div>
    } @else {
      <div class="hidden w-50 md:block">
        <ng-container [ngTemplateOutlet]="content" />
      </div>
    }`,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SideNavigationComponent {
  readonly menuOpen = model(false);
  readonly sections = [
    {
      title: 'Getting Started',
      links: [
        {
          link: './getting-started/what-is-ngrx-traits',
          name: 'What is Ngrx Traits?',
        },
        {
          link: './getting-started/installation',
          name: 'Installation',
        },
        {
          link: './getting-started/start-coding',
          name: 'Start Coding',
        },
        {
          link: './getting-started/working-with-entities',
          name: 'Working with Entities',
        },
        {
          link: './getting-started/caching',
          name: 'Caching',
        },
        {
          link: 'https://stackblitz.com/github/gabrielguerrero/ngrx-traits-signals-playground?file=src%2Fapp%2Fproduct-list-detail%2Fproduct-local.store.ts',
          name: 'Playground',
          external: true,
        },
        {
          link: 'https://github.com/gabrielguerrero/ngrx-traits/tree/main/apps/example-app/src/app/examples/signals',
          name: 'Examples',
          external: true,
        },
        {
          link: './getting-started/articles-and-videos',
          name: 'Articles and Videos',
        },
      ],
    },
  ] as Section[];
  storeFeatures = [
    {
      title: 'Call Backend',
      links: [
        {
          link: './traits/with-calls',
          name: 'withCalls',
        },
        {
          link: './traits/with-call-status',
          name: 'withCallStatus',
        },
        {
          link: './traits/with-entities-loading-call',
          name: 'withEntitiesLoadingCall',
        },
        {
          link: './traits/with-call-status-map',
          name: 'withCallStatusMap',
        },
        {
          link: './traits/with-entities-calls',
          name: 'withEntitiesCalls',
        },
        {
          link: './traits/with-all-call-status',
          name: 'withAllCallStatus',
        },
      ],
    },
    {
      title: 'Entities Filtering',
      links: [
        {
          link: './traits/with-entities-local-filter',
          name: 'withEntitiesLocalFilter',
        },
        {
          link: './traits/with-entities-remote-filter',
          name: 'withEntitiesRemoteFilter',
        },
        {
          link: './traits/with-entities-hybrid-filter',
          name: 'withEntitiesHybridFilter',
        },
      ],
    },
    {
      title: 'Entities Pagination',
      links: [
        {
          link: './traits/with-entities-local-pagination',
          name: 'withEntitiesLocalPagination',
        },
        {
          link: './traits/with-entities-remote-pagination',
          name: 'withEntitiesRemotePagination',
        },
        {
          link: './traits/with-entities-remote-scroll-pagination',
          name: 'withEntitiesRemoteScrollPagination',
        },
      ],
    },
    {
      title: 'Entities Selection',
      links: [
        {
          link: './traits/with-entities-single-selection',
          name: 'withEntitiesSingleSelection',
        },
        {
          link: './traits/with-entities-multi-selection',
          name: 'withEntitiesMultiSelection',
        },
      ],
    },
    {
      title: 'Entities Sorting',
      links: [
        {
          link: './traits/with-entities-local-sort',
          name: 'withEntitiesLocalSort',
        },
        {
          link: './traits/with-entities-remote-sort',
          name: 'withEntitiesRemoteSort',
        },
      ],
    },
    {
      title: 'Sync State To Url, Web Storage and SSR',
      links: [
        {
          link: './traits/with-sync-to-web-storage',
          name: 'withSyncToWebStorage',
        },
        {
          link: './traits/with-route-params',
          name: 'withRouteParams',
        },
        {
          link: './traits/with-entities-sync-to-route-query-params',
          name: 'withEntitiesSyncToRouteQueryParams',
        },
        {
          link: './traits/with-sync-to-route-query-params',
          name: 'withSyncToRouteQueryParams',
        },
        {
          link: './traits/with-server-state-transfer',
          name: 'withServerStateTransfer',
        },
      ],
    },
    {
      title: 'Others',
      links: [
        {
          link: './traits/with-logger',
          name: 'withLogger',
        },
        {
          link: './traits/with-feature-factory',
          name: 'withFeatureFactory',
        },
      ],
    },
  ] as Section[];
}

interface Section {
  title: string;
  links: Link[];
}

interface Link {
  link: string;
  external?: boolean;
  name: string;
}
