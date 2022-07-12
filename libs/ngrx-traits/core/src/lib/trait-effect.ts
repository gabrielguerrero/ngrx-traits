import { Injectable, inject } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import {
  Actions,
  ofType,
  OnIdentifyEffects,
  OnRunEffects,
} from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

@Injectable()
export class TraitEffect implements OnIdentifyEffects, OnRunEffects {
  private name = this.constructor.name;
  public componentId = '';
  protected actions$ = inject(Actions);
  protected store = inject(Store<any>);

  ngrxOnIdentifyEffects() {
    return this.componentId ? this.name + this.componentId : '';
  }

  ngrxOnRunEffects(resolvedEffects$: Observable<any>) {
    return this.componentId
      ? resolvedEffects$.pipe(
          takeUntil(
            this.actions$.pipe(ofType(getDestroyActionName(this.componentId)))
          )
        )
      : resolvedEffects$;
  }
}

export function getDestroyActionName(id: string) {
  return `[${id}] Destroyed`;
}
