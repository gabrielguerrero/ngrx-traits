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
            <h2 class="text-md mb-2 font-semibold text-zinc-800">
              {{ section.title }}
            </h2>
            <ul class="-ml-4">
              @for (link of section.links; track link) {
                <li class="text-zinc-600">
                  <a
                    class="flex h-8 items-center rounded-lg px-4 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-blue-500"
                    [routerLink]="link.link"
                    routerLinkActive="bg-gradient-to-b from-[#e90364] to-[#fa2c05] text-transparent bg-clip-text"
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
  readonly sections = Object.entries(getRouterLinks())
    .map(([path, data]) => {
      // the path as we get it starts with '../pages/', so we remove it, and it also ends with '.md', so we remove it
      const normalizedPath = path.replace('../pages/', '').replace('.md', '');

      // next split the path up, the first part is the section, the second part is the page
      const [section] = normalizedPath.split('/');

      // normalize the section name, e.g. 'getting-started' -> 'Getting Started'
      const sectionTitle = section
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      return {
        section: sectionTitle,
        link: normalizedPath,
        name: data['name'],
        order: data['order'] ?? Infinity,
      };
    })
    // next group the links by section
    .reduce<Section[]>((acc, { section, link, name, order }) => {
      const existingSection = acc.find((s) => s.title === section);

      if (existingSection) {
        existingSection.links.push({ link, name, order });

        // sort the links based on the order property if defined
        existingSection.links.sort((a, b) => a.order - b.order);
      } else {
        acc.push({ title: section, links: [{ link, name, order }] });
      }

      return acc;
    }, [])
    // sort so that getting started is always first
    .sort((a, b) => {
      const order = ['Getting Started', 'Signals', 'Traits'];

      // sort based on the order of the section titles
      return order.indexOf(a.title) - order.indexOf(b.title);
    });
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
