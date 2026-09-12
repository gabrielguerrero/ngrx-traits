import { isPlatformBrowser } from '@angular/common';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  PLATFORM_ID,
  signal,
} from '@angular/core';

interface TocHeading {
  id: string;
  text: string;
  level: 2 | 3;
}

/** keeps the heading clear of the fixed navbar when jumping or scroll-spying */
const HEADING_OFFSET = 96;

/**
 * "On this page" menu. Reads the h2/h3 headings of the rendered markdown
 * (marked-gfm-heading-id already gives them ids), so pages need nothing extra.
 * Built in the browser only: the markdown renders asynchronously and swaps on
 * every navigation, so a MutationObserver rebuilds the list when it changes.
 */
@Component({
  selector: 'docs-page-toc',
  standalone: true,
  template: `
    @if (headings().length) {
      <nav
        class="sticky top-24 max-h-[calc(100dvh-7rem)] overflow-y-auto overscroll-contain"
        aria-labelledby="page-toc-title"
      >
        <h2
          id="page-toc-title"
          class="mb-3 text-sm font-semibold text-zinc-800 dark:text-white"
        >
          On this page
        </h2>
        <ul class="border-l border-zinc-200 dark:border-zinc-700">
          @for (heading of headings(); track heading.id) {
            <li>
              <a
                class="-ml-px block border-l py-1 pr-2 text-[13px] leading-5 break-words transition-colors hover:text-blue-500"
                [class]="
                  heading.id === activeId()
                    ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                    : 'border-transparent text-zinc-600 dark:text-zinc-400'
                "
                [class.pl-3]="heading.level === 2"
                [class.pl-6]="heading.level === 3"
                [attr.href]="path() + '#' + heading.id"
                [attr.aria-current]="
                  heading.id === activeId() ? 'location' : null
                "
                (click)="onLinkClick($event, heading.id)"
                >{{ heading.text }}</a
              >
            </li>
          }
        </ul>
        <button
          type="button"
          class="mt-4 flex items-center gap-1.5 text-[13px] text-zinc-600 transition-colors hover:text-blue-500 dark:text-zinc-400"
          (click)="backToTop()"
        >
          <span aria-hidden="true">↑</span> Back to the top
        </button>
      </nav>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'hidden w-52 shrink-0 xl:block',
  },
})
export class PageTocComponent {
  /** element containing the routed page, headings are read from its [data-page-content] */
  readonly container = input.required<HTMLElement>();

  readonly headings = signal<TocHeading[]>([]);
  readonly activeId = signal<string | null>(null);
  /** current page path, links need it because <base href="/"> would resolve a bare #id to the home page */
  readonly path = signal('');

  /** set while a jump scrolls, so scroll-spy does not flick through every heading on the way */
  private jumping = false;
  private jumpTimer?: ReturnType<typeof setTimeout>;
  /** heading picked from the menu, stays highlighted until the user scrolls themselves */
  private pinnedId: string | null = null;
  /** page whose #hash deep link has already been honoured */
  private deepLinkedPath: string | null = null;

  constructor() {
    const destroyRef = inject(DestroyRef);
    // the prerender still runs afterNextRender, and has no MutationObserver
    if (!isPlatformBrowser(inject(PLATFORM_ID))) return;

    afterNextRender(() => {
      // one frame per task, so a scroll never cancels a pending rescan.
      // batches bursts of dom changes (markdown render, prism highlighting)
      let scanFrame = 0;
      let scrollFrame = 0;

      const observer = new MutationObserver(() => {
        cancelAnimationFrame(scanFrame);
        scanFrame = requestAnimationFrame(() => this.scan());
      });
      observer.observe(this.container(), { childList: true, subtree: true });
      this.scan();

      const onScroll = () => {
        if (this.jumping) return;
        this.pinnedId = null;
        cancelAnimationFrame(scrollFrame);
        scrollFrame = requestAnimationFrame(() => this.updateActive());
      };
      const onScrollEnd = () => this.endJump();
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('scrollend', onScrollEnd);

      destroyRef.onDestroy(() => {
        observer.disconnect();
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('scrollend', onScrollEnd);
        cancelAnimationFrame(scanFrame);
        cancelAnimationFrame(scrollFrame);
        clearTimeout(this.jumpTimer);
      });
    });
  }

  onLinkClick(event: MouseEvent, id: string): void {
    // leave modified clicks (new tab, etc.) to the browser, the href is real
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey)
      return;
    // a router fragment navigation would trigger the layout's scroll-to-top
    event.preventDefault();
    this.jumpTo(id, this.scrollBehavior());
    history.replaceState(history.state, '', `${this.path()}#${id}`);
  }

  backToTop(): void {
    this.pinnedId = null;
    window.scrollTo({ top: 0, behavior: this.scrollBehavior() });
  }

  private jumpTo(id: string, behavior: ScrollBehavior): void {
    const target = document.getElementById(id);
    if (!target) return;

    this.pinnedId = id;
    this.activeId.set(id);

    const top =
      target.getBoundingClientRect().top + window.scrollY - HEADING_OFFSET;
    const maxTop = document.documentElement.scrollHeight - window.innerHeight;
    // no movement means no scrollend, so there is nothing to wait for
    if (Math.abs(Math.min(Math.max(top, 0), maxTop) - window.scrollY) < 1)
      return;

    this.jumping = true;
    clearTimeout(this.jumpTimer);
    // scrollend is missing in older safari
    if (!('onscrollend' in window))
      this.jumpTimer = setTimeout(() => this.endJump(), 1000);

    window.scrollTo({ top, behavior });
  }

  private endJump(): void {
    clearTimeout(this.jumpTimer);
    this.jumping = false;
  }

  private scan(): void {
    const found = Array.from(
      this.container().querySelectorAll<HTMLHeadingElement>(
        '[data-page-content] :is(h2, h3)[id]',
      ),
      (el) =>
        ({
          id: el.id,
          text: el.textContent?.trim() ?? '',
          level: el.tagName === 'H2' ? 2 : 3,
        }) as TocHeading,
    );

    // the observer also sees this component's own re-render, only update on
    // a real change so that does not loop
    const current = this.headings();
    const changed =
      found.length !== current.length ||
      found.some(
        (h, i) => h.id !== current[i].id || h.text !== current[i].text,
      );
    if (changed) {
      this.pinnedId = null;
      this.headings.set(found);
    }
    this.path.set(location.pathname + location.search);

    this.followDeepLink(found);
    this.updateActive();
  }

  /**
   * a shared /page#section link: the layout scrolls to the top on navigation,
   * so once the page's headings exist, go to the section it points at
   */
  private followDeepLink(headings: TocHeading[]): void {
    const path = this.path();
    if (!headings.length || this.deepLinkedPath === path) return;
    this.deepLinkedPath = path;

    const id = decodeURIComponent(location.hash.slice(1));
    if (id && headings.some((h) => h.id === id)) this.jumpTo(id, 'auto');
  }

  /** the last heading scrolled past the navbar is the section being read */
  private updateActive(): void {
    if (this.pinnedId) return;
    const headings = this.headings();

    // short trailing sections can never reach the top, so at the bottom of the
    // page the last one wins
    const atBottom =
      window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight - 2;
    if (atBottom && headings.length) {
      this.activeId.set(headings[headings.length - 1].id);
      return;
    }

    let active: string | null = null;
    for (const { id } of headings) {
      const el = document.getElementById(id);
      if (!el) continue;
      if (el.getBoundingClientRect().top - HEADING_OFFSET - 1 > 0) break;
      active = id;
    }
    // before the first heading, point at it rather than at nothing
    this.activeId.set(active ?? headings[0]?.id ?? null);
  }

  private scrollBehavior(): ScrollBehavior {
    return matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 'auto'
      : 'smooth';
  }
}
