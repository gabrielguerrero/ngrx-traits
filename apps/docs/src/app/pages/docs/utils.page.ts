import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  standalone: true,
  selector: 'docs-utils',
  template: `
    <div class="flex gap-x-12">
      <div
        class="prose dark:prose-invert prose-sm prose-zinc max-w-3xl flex-1 overflow-hidden px-px"
        data-page-content
      >
        <p
          class="from-primary to-accent mb-2 inline-block bg-gradient-to-r bg-clip-text text-sm font-medium text-transparent"
        >
          Utils
        </p>
        <router-outlet />
      </div>
    </div>
  `,
  imports: [RouterOutlet],
  host: {
    class: 'flex-1 overflow-hidden',
  },
})
export default class UtilsPage {}
