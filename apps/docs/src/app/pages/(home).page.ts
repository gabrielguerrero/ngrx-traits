import { NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { FooterComponent } from '../components/navbar/footer/footer.component';
import { NavbarComponent } from '../components/navbar/navbar.component';

@Component({
  selector: 'app-home',
  standalone: true,
  template: ` <docs-navbar />
    <div class="background-container grid grid-rows-[auto_1fr_auto]">
      <div>
        <section class="max-w-max m-auto  mt-16 mb-4 ">
          <div class="grid gap-6 relative z-30 ]">
            <div>
              <img
                ngSrc="/ngrx-traits/logo_name_transparent.PNG"
                alt="Gabriel Guerrero Picture"
                width="426"
                height="426"
                srcset
                priority
                class="m-auto opacity-80"
              />
            </div>

            <p
              class="p-4 sm:rounded-2xl  bg-white bg-opacity-5 max-w-xl text-xl font-light leading-9 text-zinc-300 "
            >
              <span class="text-blue-300 font-bold">Ngrx Traits</span> is a set
              of NgRx Signals Custom Store Features that will speed up your
              development by solving common problems such as calling a backend,
              adding pagination, sorting, filtering, selection of entities, and
              more.
            </p>
            <div class="grid gap-2 mt-4">
              <div class="flex justify-center ">
                <a href="/docs/getting-started/what-is-ngrx-traits">
                  <button
                    type="button"
                    class="flex gap-2 p-4 rounded-lg  font-bold bg-blue-600 "
                  >
                    <span class="text-white">Read the Docs</span>
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
  imports: [
    NgOptimizedImage,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    NavbarComponent,
    FooterComponent,
  ],
})
export default class HomeComponent {}
