import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  standalone: true,
  selector: 'docs-traits',
  template: `
    <div class="flex gap-x-12">
      <div
        class="prose dark:prose-invert prose-sm prose-zinc max-w-3xl flex-1 overflow-hidden px-px"
        data-page-content
      >
        <p
          class="from-primary to-accent mb-2 inline-block bg-gradient-to-r bg-clip-text text-xl font-medium text-transparent"
        >
          Store Features
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
export default class TraitsPage {}
