import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // {
  //   path: '',
  //   renderMode: RenderMode.Client,
  // },
  {
    path: 'signals/product-list-ssr',
    renderMode: RenderMode.Server,
  },
  {
    path: 'signals/product-list-paginated/*',
    renderMode: RenderMode.Client,
  },
  // {
  //   path: 'signals/**',
  //   renderMode: RenderMode.Client,
  // },
  {
    path: 'ngrx/**',
    renderMode: RenderMode.Client,
  },
  // {
  //   path: '**',
  //   renderMode: RenderMode.Client,
  // },
];
