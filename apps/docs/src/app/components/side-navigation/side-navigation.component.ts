import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { getRouterLinks } from '../../utils/router';

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
                  <a
                    class="flex h-8 items-center rounded-lg px-4 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 hover:text-blue-500"
                    [routerLink]="link.link"
                    routerLinkActive="text-sm font-medium text-[#629ef8] "
                  >
                    {{ link.name }}
                  </a>
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
                  <a
                    class="flex h-8 items-center  px-4 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 hover:text-blue-500"
                    [routerLink]="link.link"
                    routerLinkActive="text-sm font-medium text-blue-400 "
                  >
                    {{ link.name }}
                  </a>
                </li>
              }
            </ul>
          </div>
        }
      </div>
    </ng-template>
    @if (menuOpen()) {
      <div class="fixed inset-0 z-10 bg-black/50" (click)="menuOpen.set(false)">
        <div
          class="h-full w-85 max-w-full bg-white px-10 shadow-xl"
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
          order: 1,
        },
        {
          link: './getting-started/installation',
          name: 'Installation',
          order: 2,
        },
        {
          link: './getting-started/start-coding',
          name: 'Start Coding',
          order: 3,
        },
      ],
    },
  ];
  storeFeatures = [
    {
      title: 'Call Backend',
      links: [
        {
          link: './traits/withCallStatus',
          name: 'withCallStatus',
          order: 1,
        },
        {
          link: './traits/withCalls',
          name: 'withCalls',
          order: 2,
        },
        {
          link: './traits/withEntitiesLoadingCall',
          name: 'withEntitiesLoadingCall',
          order: 5,
        },
      ],
    },
    {
      title: 'Entities Filtering',
      links: [
        {
          link: './traits/withEntitiesLocalFilter',
          name: 'withEntitiesLocalFilter',
          order: 3,
        },
        {
          link: './traits/withEntitiesRemoteFilter',
          name: 'withEntitiesRemoteFilter',
          order: 4,
        },
        {
          link: './traits/withEntitiesHybridFilter',
          name: 'withEntitiesHybridFilter',
          order: 4,
        },
      ],
    },
    {
      title: 'Entities Pagination',
      links: [
        {
          link: './traits/withEntitiesLocalPagination',
          name: 'withEntitiesLocalPagination',
          order: 6,
        },
        {
          link: './traits/withEntitiesRemotePagination',
          name: 'withEntitiesRemotePagination',
          order: 7,
        },
        {
          link: './traits/withEntitiesRemoteScrollPagination',
          name: 'withEntitiesRemoteScrollPagination',
          order: 8,
        },
      ],
    },
    {
      title: 'Entities Selection',
      links: [
        {
          link: './traits/withEntitiesSingleSelection',
          name: 'withEntitiesSingleSelection',
          order: 9,
        },
        {
          link: './traits/withEntitiesMultiSelection',
          name: 'withEntitiesMultiSelection',
          order: 10,
        },
      ],
    },
    {
      title: 'Entities Sorting',
      links: [
        {
          link: './traits/withEntitiesLocalSort',
          name: 'withEntitiesLocalSort',
          order: 11,
        },
        {
          link: './traits/withEntitiesRemoteSort',
          name: 'withEntitiesRemoteSort',
          order: 12,
        },
      ],
    },
    {
      title: 'Sync State To Url and Web Storage',
      links: [
        {
          link: './traits/withSyncToWebStorage',
          name: 'withSyncToWebStorage',
          order: 15,
        },
        {
          link: './traits/withRouteParams',
          name: 'withRouteParams',
          order: 16,
        },
        {
          link: './traits/withEntitiesSyncToRouteQueryParams',
          name: 'withEntitiesSyncToRouteQueryParams',
          order: 17,
        },
        {
          link: './traits/withSyncToRouteQueryParams',
          name: 'withSyncToRouteQueryParams',
          order: 18,
        },
      ],
    },
    {
      title: 'Others',
      links: [
        {
          link: './traits/withStateLogger',
          name: 'withStateLogger',
          order: 14,
        },
        {
          link: './traits/withFeatureFactory',
          name: 'withFeatureFactory',
          order: 15,
        },
      ],
    },
  ];
}

interface Section {
  title: string;
  links: Link[];
}

interface Link {
  link: string;
  name: string;
  order: number;
}
