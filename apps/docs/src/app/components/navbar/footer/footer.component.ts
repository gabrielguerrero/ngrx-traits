import { Component } from '@angular/core';

@Component({
  selector: 'docs-footer',
  standalone: true,
  host: { class: 'block' },
  template: `<footer class="grid pt-24 text-zinc-300 z-10">
    <div class="grid sm:grid-cols-3 gap-8 sm:gap-24">
      <ul class="flex flex-col gap-2">
        <li class="font-bold">Documentation</li>
        <li>
          <a href="/docs/getting-started/what-is-ngrx-traits">Introduction</a>
        </li>
        <li>
          <a href="/docs/getting-started/start-coding">Start Coding</a>
        </li>
      </ul>

      <ul class="flex flex-col gap-2">
        <li class="font-bold">Open Source</li>
        <li>
          <a
            href="https://github.com/gabrielguerrero/ngrx-traits/graphs/contributors"
            >Contributors</a
          >
        </li>
        <li>
          <a
            href="https://github.com/gabrielguerrero/ngrx-traits/blob/main/CONTRIBUTING.md"
            >Contribute</a
          >
        </li>
        <li><a href="/docs/other/sponsor">Sponsor</a></li>
      </ul>

      <ul class="flex flex-col gap-2">
        <li class="font-bold">More</li>
        <li>
          <a href="https://github.com/gabrielguerrero/ngrx-traits">Github</a>
        </li>
        <li>
          <a href="https://medium.com/@gabrieldavidguerrero">Blog</a>
        </li>
        <li><a href="https://discord.gg/CEjF5D3NCh">Discord</a></li>
      </ul>
    </div>
    <div class="">
      <p class="px-8 py-8 text-center text-xs">
        Copyright © {{ year }} Ngrx Traits
      </p>
    </div>
  </footer>`,
})
export class FooterComponent {
  readonly year = new Date().getFullYear();
}
