import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { CacheAndDropdownsPageComponent } from './cache-and-dropdowns-page.component';

const routes: Routes = [
  {
    path: '',
    component: CacheAndDropdownsPageComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CacheAndDropdownsRoutingModule {}
