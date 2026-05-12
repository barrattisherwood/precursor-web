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
    edgeType: null,
    tags: [],
    elementId: null,
    elementName: null,
    ascendancyClass: null,
  });

  readonly clusters = this._clusters.asReadonly();
  readonly total = this._total.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly filters = this._filters.asReadonly();
  readonly page = this._page.asReadonly();
  readonly hasResults = computed(() => this._clusters().length > 0);
  readonly pageSize = 20;
  readonly totalPages = computed(() => Math.ceil(this._total() / this.pageSize));
  readonly hasPrev = computed(() => this._page() > 0);
  readonly hasNext = computed(() => this._page() < this.totalPages() - 1);

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

  nextPage(): void {
    if (this.hasNext()) {
      this._page.update(p => p + 1);
      this.load();
    }
  }

  prevPage(): void {
    if (this.hasPrev()) {
      this._page.update(p => p - 1);
      this.load();
    }
  }
}
