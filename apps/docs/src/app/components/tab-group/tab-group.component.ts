import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  Signal,
  signal,
} from '@angular/core';

import type { TabComponent } from '../tab/tab.component';

@Component({
  selector: 'docs-tab-group',
  standalone: true,
  template: ` <div class="mb-3 flex gap-x-4 border-b">
      @for (tab of tabs(); track tab.label) {
        <button
          class="focus-visible:ring-primary -mb-px h-10 border-b-2 font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-opacity-50 focus-visible:ring-offset-2"
          [ngClass]="{
            'border-primary text-zinc-600 dark:text-zinc-300':
              activeTab()?.label === tab.label,
            'border-transparent text-zinc-500': activeTab()?.label !== tab.label
          }"
          (click)="activeTab.set(tab)"
        >
          {{ tab.label() }}
        </button>
      }
    </div>

    <ng-content />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass],
})
export class TabGroupComponent {
  private readonly elementRef =
    inject<ElementRef<HTMLElement & TabGroup>>(ElementRef);
  protected readonly activeTab = signal<TabComponent | null>(null);
  protected readonly tabs = signal<TabComponent[]>([]);

  constructor() {
    // expose the add method to the custom element
    this.elementRef.nativeElement.activeTab = this.activeTab;
    this.elementRef.nativeElement.add = this.add.bind(this);
  }

  add(tab: TabComponent): void {
    this.tabs.update((prev) => [...prev, tab]);

    // if no tab is active, set the first tab as active
    if (!this.activeTab()) {
      this.activeTab.update(() => tab);
    }
  }
}

export interface TabGroup {
  activeTab: Signal<TabComponent | null>;

  add(tab: TabComponent): void;
}
