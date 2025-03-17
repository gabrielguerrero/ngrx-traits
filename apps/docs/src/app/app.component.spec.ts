import { CommonModule, isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NavigationEnd, Router } from '@angular/router';
import { Subject } from 'rxjs';

import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let routerEvents$: Subject<any>;
  let platformId: Object;

  beforeEach(() => {
    routerEvents$ = new Subject();

    TestBed.configureTestingModule({
      imports: [AppComponent, CommonModule],
      providers: [
        {
          provide: Router,
          useValue: { events: routerEvents$.asObservable() },
        },
        {
          provide: PLATFORM_ID,
          useValue: 'browser', // mock browser platform
        },
      ],
    });
  });

  it('should create the component and close menu on navigation', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const component = fixture.componentInstance;

    // Manually open the menu
    component.menuOpen.set(true);
    expect(component.menuOpen()).toBe(true);

    // Emit NavigationEnd event
    routerEvents$.next(new NavigationEnd(1, '/old', '/new'));

    // The menu should now be closed
    expect(component.menuOpen()).toBe(false);
  });
});
