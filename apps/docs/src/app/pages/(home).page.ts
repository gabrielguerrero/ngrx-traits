import { Component } from '@angular/core';

import { FooterComponent } from '../components/navbar/footer/footer.component';
import { NavbarComponent } from '../components/navbar/navbar.component';

@Component({
  selector: 'app-home',
  standalone: true,
  template: ` <docs-navbar />
    <div class="background-container grid grid-rows-[auto_1fr_auto]">
      <div class="aurora" aria-hidden="true"><i></i><i></i><i></i></div>
      <div class="circuit" aria-hidden="true"><i></i></div>
      <div>
        <section class="max-w-max m-auto  mt-16 sm:mt-24 mb-4 ">
          <div class="grid gap-6 relative z-30">
            <div class="hero-logo" role="img" aria-label="NgRx Traits">
              <span class="hero-logo-fill"></span>
            </div>

            <p
              class="p-4 rounded-2xl bg-white/70 dark:bg-zinc-950/70 max-w-xl text-xl font-light leading-9 text-zinc-700 dark:text-zinc-300 "
            >
              <span class="text-blue-700 dark:text-blue-300 font-bold"
                >Ngrx Traits</span
              >
              is a set of NgRx Signals Custom Store Features that will speed up
              your development by solving common problems such as calling a
              backend, adding pagination, sorting, filtering, selection of
              entities, and more.
            </p>
            <div class="grid gap-2 mt-4">
              <div class="flex justify-center ">
                <a href="/docs/getting-started/what-is-ngrx-traits">
                  <button
                    type="button"
                    class="flex gap-2 p-4 rounded-lg font-bold border-2 border-blue-500 bg-blue-400/30 backdrop-blur-sm dark:border-blue-400 dark:bg-blue-500/35"
                  >
                    <span class="text-blue-700 dark:text-blue-100"
                      >Read the Docs</span
                    >
                  </button>
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div class="flex justify-center items-center h-50 relative">
        <docs-footer class="z-10 mt-80 sm:mt-0" />
        <div>
          <div class="wave"></div>
          <div class="wave"></div>
          <div class="wave"></div>
        </div>
      </div>
    </div>`,
  styleUrls: ['./index.page.css'],
  imports: [NavbarComponent, FooterComponent],
})
export default class HomeComponent {}
