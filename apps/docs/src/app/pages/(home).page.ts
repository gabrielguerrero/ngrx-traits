import { NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

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
            <!--          <div-->
            <!--            class="p-2 mb-6 mt-6 text-5xl font-semibold tracking-tight lg:text-6xl"-->
            <!--          >-->
            <!--            <div class="inline-grid justify-center">-->
            <!--              <span-->
            <!--                class="text-transparent opacity-90 bg-clip-text bg-gradient-to-r from-purple-400 to-violet-700"-->
            <!--              >-->
            <!--                Ngrx Traits</span-->
            <!--              >-->
            <!--            </div>-->
            <!--          </div>-->
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
              <!--            <div class="skills flex gap-4 p-2  justify-between items-center">-->
              <!--              <img-->
              <!--                src="logos/angular_gradient.png"-->
              <!--                class="h-14 sm:h-20"-->
              <!--                alt="Angular"-->
              <!--                title="Angular"-->
              <!--              />-->
              <!--              <img-->
              <!--                src="logos/7423888_react_react native_icon.svg"-->
              <!--                class="h-12 sm:h-16"-->
              <!--                alt="React"-->
              <!--                title="React"-->
              <!--              />-->
              <!--              <img-->
              <!--                src="logos/1012818_code_development_logo_nodejs_icon.svg"-->
              <!--                class="h-14 sm:h-20"-->
              <!--                alt="NodeJs"-->
              <!--                title="NodeJs"-->
              <!--              /><img-->
              <!--                src="logos/4373217_java_logo_logos_icon.svg"-->
              <!--                class="h-10 sm:h-16"-->
              <!--                alt="Java"-->
              <!--                title="Java"-->
              <!--              /><img-->
              <!--                src="logos/kotlin-1.svg"-->
              <!--                class="h-10"-->
              <!--                alt="Kotlin"-->
              <!--                title="Kotlin"-->
              <!--              />-->
              <!--              <img src="logos/c&#45;&#45;4.svg" class="h-14" alt="C#" title="C#" />-->
              <!--            </div>-->
              <div class="flex justify-center ">
                <a href="/docs/getting-started/what-is-ngrx-traits">
                  <button
                    type="button"
                    class="flex gap-2 p-4 bg-black rounded-lg border-gray-200 border font-bold backdrop-opacity-70 "
                  >
                    <span class="text-blue-500 hover:text-[#C81FC7FF]"
                      >Read the Docs</span
                    >
                  </button>
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
      <!--    <div class="grid gap-2 mt-8 relative z-50">-->
      <!--      <span class="text-gray-200  text-2xl text-center font-bold"-->
      <!--        >Find me on</span-->
      <!--      >-->
      <!--      <div class="skills flex gap-4 p-4 justify-center items-center">-->
      <!--        <a href="https://github.com/gabrielguerrero" target="_blank"-->
      <!--          ><img src="logos/github-icon.svg" class="h-8" alt="github"-->
      <!--        /></a>-->
      <!--        <a-->
      <!--          href="https://www.linkedin.com/in/gabriel-guerrero-3245295/"-->
      <!--          target="_blank"-->
      <!--          ><img src="logos/In-White-40.png" class="h-8" alt="linkedin"-->
      <!--        /></a>-->
      <!--        <a href="https://x.com/gabrieldgi" target="_blank"-->
      <!--          ><img src="logos/twitter-icon.svg" class="h-8" alt="twitter"-->
      <!--        /></a>-->
      <!--        <a href="mailto:gabriel@g2creativesolutions.com" target="_blank"-->
      <!--          ><img src="logos/mail.svg" class="h-8" alt="email"-->
      <!--        /></a>-->
      <!--        &lt;!&ndash;              <a href="" target="_blank"&ndash;&gt;-->
      <!--        &lt;!&ndash;                ><img src="logos/youtube-logo.png" class="h-8"&ndash;&gt;-->
      <!--        &lt;!&ndash;              /></a>&ndash;&gt;-->
      <!--      </div>-->
      <!--    </div>-->
      <div class="flex justify-center items-center h-40 relative">
        <div>
          <div class="wave"></div>
          <div class="wave"></div>
          <div class="wave"></div>
        </div>
        <div class="">
          <div class="flex">
            <!--        <docs-side-navigation class=" md:mr-12" [(menuOpen)]="menuOpen" />-->
            <router-outlet />
          </div>
          <p class="px-8 py-8 text-center text-xs text-zinc-500">
            Copyright © {{ year }} Ngrx Traits
          </p>
        </div>
        <!--      <nav class="footer flex gap-4 text-2xl relative h-14 items-center">-->
        <!--        <a-->
        <!--          routerLink="/"-->
        <!--          routerLinkActive="text-orange-400"-->
        <!--          class="scroll-down text-gray-200"-->
        <!--          [routerLinkActiveOptions]="{ exact: true }"-->
        <!--          >About</a-->
        <!--        >-->
        <!--        <a-->
        <!--          class="scroll-down text-gray-200"-->
        <!--          routerLink="/projects"-->
        <!--          routerLinkActive="text-orange-400"-->
        <!--          [routerLinkActiveOptions]="{ exact: true }"-->
        <!--          >Projects</a-->
        <!--        >-->
        <!--        <a-->
        <!--          routerLink="/blog"-->
        <!--          routerLinkActive="text-orange-400"-->
        <!--          class="scroll-down text-gray-200"-->
        <!--          [routerLinkActiveOptions]="{ exact: true }"-->
        <!--          >Blog</a-->
        <!--        >-->
        <!--      </nav>-->
      </div>
    </div>`,
  styleUrls: ['./index.page.css'],
  imports: [
    NgOptimizedImage,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    NavbarComponent,
  ],
})
export default class HomeComponent {
  readonly year = new Date().getFullYear();
}
