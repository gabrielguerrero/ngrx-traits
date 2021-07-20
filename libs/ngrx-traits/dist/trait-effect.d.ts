import { Actions, OnIdentifyEffects, OnRunEffects } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
export declare class TraitEffect implements OnIdentifyEffects, OnRunEffects {
  protected actions$: Actions;
  protected store: Store<any>;
  private name;
  componentId: string;
  constructor(actions$: Actions, store: Store<any>);
  ngrxOnIdentifyEffects(): string;
  ngrxOnRunEffects(resolvedEffects$: Observable<any>): Observable<any>;
}
export declare function getDestroyActionName(id: string): string;
