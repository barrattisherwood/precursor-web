import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: 'explore', renderMode: RenderMode.Client },
  { path: 'economy', renderMode: RenderMode.Client },
  { path: 'about', renderMode: RenderMode.Client },
  { path: 'clusters', renderMode: RenderMode.Server },
  { path: 'clusters/:id', renderMode: RenderMode.Server },
  { path: 'elements/:id', renderMode: RenderMode.Server },
  { path: '', renderMode: RenderMode.Server },
  { path: '**', renderMode: RenderMode.Prerender },
];
