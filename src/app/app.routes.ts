import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'clusters',
    loadComponent: () =>
      import('./features/cluster-browser/cluster-browser.component').then(
        m => m.ClusterBrowserComponent,
      ),
  },
  {
    path: 'clusters/:id',
    loadComponent: () =>
      import('./features/cluster-detail/cluster-detail.component').then(
        m => m.ClusterDetailComponent,
      ),
  },
  {
    path: 'elements/:id',
    loadComponent: () =>
      import('./features/element-detail/element-detail.component').then(
        m => m.ElementDetailComponent,
      ),
  },
  {
    path: 'explore',
    loadComponent: () =>
      import('./features/synergy-explorer/synergy-explorer.component').then(
        m => m.SynergyExplorerComponent,
      ),
  },
  {
    path: 'economy',
    loadComponent: () =>
      import('./features/economy/economy.component').then(m => m.EconomyComponent),
  },
  {
    path: 'about',
    loadComponent: () =>
      import('./features/about/about.component').then(m => m.AboutComponent),
  },
  { path: '', redirectTo: 'clusters', pathMatch: 'full' },
];
