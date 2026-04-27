import { Injectable, signal, computed, inject } from '@angular/core';
import { ClusterService } from '../services/cluster.service';
import { SynergyCluster, ClusterFilters } from '../types/cluster.types';

@Injectable({ providedIn: 'root' })
export class ClusterStore {
  private readonly clusterService = inject(ClusterService);

  private readonly _clusters = signal<SynergyCluster[]>([]);
  private readonly _total = signal(0);
  private readonly _loading = signal(false);
  private readonly _page = signal(0);
  private readonly _filters = signal<ClusterFilters>({
    facet: null,
    spiritFeasible: false,
    leagueScoped: false,
    sortBy: 'hidden_score',
  });

  readonly clusters = this._clusters.asReadonly();
  readonly total = this._total.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly filters = this._filters.asReadonly();
  readonly hasResults = computed(() => this._clusters().length > 0);

  async load(): Promise<void> {
    this._loading.set(true);
    try {
      const result = await this.clusterService.getClusters(this._filters(), this._page());
      this._clusters.set(result.clusters);
      this._total.set(result.total);
    } finally {
      this._loading.set(false);
    }
  }

  updateFilter(partial: Partial<ClusterFilters>): void {
    this._page.set(0);
    this._filters.update(current => ({ ...current, ...partial }));
    this.load();
  }
}
