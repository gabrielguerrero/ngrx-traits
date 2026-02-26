import { computed, WritableSignal } from '@angular/core';
import { SIGNAL } from '@angular/core/primitives/signals';

export function delegatedSignal<T>(options: {
  computation: () => T;
  update: (value: T) => void;
}): WritableSignal<T> {
  const internalSignal = computed(options.computation);

  const res: WritableSignal<T> = Object.assign(() => internalSignal(), {
    [SIGNAL]: internalSignal[SIGNAL],
    set: (value: T) => options.update(value),
    update: (updateFn: (value: T) => T) => {
      const newValue = updateFn(internalSignal());
      options.update(newValue);
    },
    asReadonly: () => internalSignal,
  } as WritableSignal<T>);
  return res;
}

