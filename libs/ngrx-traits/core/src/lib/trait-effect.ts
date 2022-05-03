import { Injectable } from '@angular/core';
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
  public constructor(
    protected actions$: Actions,
    protected store: Store<any>
  ) {}

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
