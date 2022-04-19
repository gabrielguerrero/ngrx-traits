import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { cacheReducer } from './cache.reducer';

@NgModule({
  imports: [StoreModule.forFeature('cache', cacheReducer)],
  providers: [],
})
export class CacheModule {}
