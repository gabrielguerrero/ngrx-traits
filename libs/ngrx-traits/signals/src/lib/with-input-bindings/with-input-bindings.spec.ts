import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { signalStore } from '@ngrx/signals';

import { withInputBindings } from './with-input-bindings';

describe('withInputBindings', () => {
  class PaginatorComponent {
    readonly pageIndex = signal(3);
    readonly length = signal(100);
    readonly pageSize = signal(10);
    readonly pageSizeOptions = signal([5, 10, 20]);
    constructor(private store: any) {
      this.store.bindInputs({
        pageIndex: this.pageIndex,
        length: this.length,
        pageSize: this.pageSize,
        pageSizeOptions: this.pageSizeOptions,
      });
    }
  }
  const Store = signalStore(
    withInputBindings({
      pageIndex: 0,
      length: 0,
      pageSize: 10,
      pageSizeOptions: [5, 10, 20],
    }),
  );

  it('should initialize state with inputs', () => {
    TestBed.runInInjectionContext(() => {
      const store = new Store();
      expect(store.pageIndex()).toBe(0);
      expect(store.length()).toBe(0);
      expect(store.pageSize()).toBe(10);
      expect(store.pageSizeOptions()).toEqual([5, 10, 20]);
    });
  });

  it('should pass components inputs to the store and any updates', () => {
    TestBed.runInInjectionContext(() => {
      const store = new Store();
      const component = new PaginatorComponent(store);
      TestBed.flushEffects();
      expect(store.pageIndex()).toBe(3);
      expect(store.length()).toBe(100);
      expect(store.pageSize()).toBe(10);
      expect(store.pageSizeOptions()).toEqual([5, 10, 20]);

      component.pageIndex.set(5);
      component.length.set(200);
      component.pageSize.set(20);
      component.pageSizeOptions.set([10, 20, 30]);

      TestBed.flushEffects();
      expect(store.pageIndex()).toBe(5);
      expect(store.length()).toBe(200);
      expect(store.pageSize()).toBe(20);
      expect(store.pageSizeOptions()).toEqual([10, 20, 30]);
    });
  });
});
