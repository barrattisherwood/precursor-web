import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClusterStore } from '../../shared/state/cluster.store';
import { ClusterFilters } from '../../shared/types/cluster.types';

const FACET_OPTIONS = [
  { value: null, label: 'All facets' },
  { value: 'skill_gem', label: 'Skill gem' },
  { value: 'support_gem', label: 'Support gem' },
  { value: 'passive_node', label: 'Passive' },
  { value: 'ascendancy_node', label: 'Ascendancy' },
  { value: 'item_affix', label: 'Item affix' },
];

const SORT_OPTIONS: { value: ClusterFilters['sortBy']; label: string }[] = [
  { value: 'hidden_score', label: 'Hidden score' },
  { value: 'theoretical_score', label: 'Theoretical score' },
  { value: 'usage_pct', label: 'Usage %' },
];

const EDGE_TYPE_OPTIONS: { value: ClusterFilters['edgeType']; label: string }[] = [
  { value: null, label: 'All types' },
  { value: 'keyword_overlap', label: 'Keyword synergy' },
  { value: 'condition_chain', label: 'Condition chain' },
];

@Component({
  selector: 'app-cluster-filters',
  imports: [FormsModule],
  templateUrl: './cluster-filters.component.html',
  styleUrl: './cluster-filters.component.scss',
})
export class ClusterFiltersComponent {
  readonly store = inject(ClusterStore);

  readonly facetOptions = FACET_OPTIONS;
  readonly sortOptions = SORT_OPTIONS;
  readonly edgeTypeOptions = EDGE_TYPE_OPTIONS;

  get filters() { return this.store.filters(); }

  setFacet(value: string | null): void {
    this.store.updateFilter({ facet: value });
  }

  setSort(value: ClusterFilters['sortBy']): void {
    this.store.updateFilter({ sortBy: value });
  }

  toggleSpirit(): void {
    this.store.updateFilter({ spiritFeasible: !this.filters.spiritFeasible });
  }

  toggleLeague(): void {
    this.store.updateFilter({ leagueScoped: !this.filters.leagueScoped });
  }

  setEdgeType(value: ClusterFilters['edgeType']): void {
    this.store.updateFilter({ edgeType: value });
  }
}
