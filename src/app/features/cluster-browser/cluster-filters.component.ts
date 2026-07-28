import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ClusterStore } from '../../shared/state/cluster.store';
import { ClusterService } from '../../shared/services/cluster.service';
import { ClusterFilters } from '../../shared/types/cluster.types';
import { Element } from '../../shared/types/element.types';
import { environment } from '../../../environments/environment';

const FACET_OPTIONS = [
  { value: null, label: 'All facets' },
  { value: 'skill_gem', label: 'Skill gem' },
  { value: 'support_gem', label: 'Support gem' },
  { value: 'passive_node', label: 'Passive' },
  { value: 'ascendancy_node', label: 'Ascendancy' },
  { value: 'item_affix', label: 'Item affix' },
  { value: 'unique_item', label: 'Unique' },
];

const EDGE_TYPE_OPTIONS: { value: ClusterFilters['edgeType']; label: string }[] = [
  { value: null, label: 'All types' },
  { value: 'keyword_overlap', label: 'Keyword synergy' },
  { value: 'condition_chain', label: 'Condition chain' },
];


@Component({
  selector: 'app-cluster-filters',
  imports: [FormsModule, TitleCasePipe],
  templateUrl: './cluster-filters.component.html',
  styleUrl: './cluster-filters.component.scss',
})
export class ClusterFiltersComponent implements OnInit {
  readonly store = inject(ClusterStore);
  private readonly http = inject(HttpClient);
  private readonly clusterService = inject(ClusterService);

  readonly facetOptions = FACET_OPTIONS;
  readonly edgeTypeOptions = EDGE_TYPE_OPTIONS;
  readonly tagOptions = signal<string[]>([]);
  readonly ascendancyGroups = signal<{ base_class: string; ascendancies: { id: string; name: string }[] }[]>([]);

  readonly isOpen = signal(false);

  toggle(): void {
    this.isOpen.update(v => !v);
  }

  readonly activePills = computed(() => {
    const f = this.store.filters();
    const pills: string[] = [];

    const facetLabel = FACET_OPTIONS.find(o => o.value === f.facet)?.label;
    if (f.facet && facetLabel) pills.push(facetLabel);

    const edgeLabel = EDGE_TYPE_OPTIONS.find(o => o.value === f.edgeType)?.label;
    if (f.edgeType && edgeLabel) pills.push(edgeLabel);

    if (f.ascendancyClass) {
      const name = this.ascendancyGroups()
        .flatMap(g => g.ascendancies)
        .find(a => a.id === f.ascendancyClass)?.name;
      pills.push(name ?? f.ascendancyClass);
    }

    if (f.spiritFeasible) pills.push('Spirit feasible');
    if (f.leagueScoped) pills.push('Include league');
    for (const tag of f.tags) pills.push(tag);
    if (f.elementName) pills.push(f.elementName);

    return pills;
  });

  async ngOnInit(): Promise<void> {
    try {
      const [tags, ascendancies] = await Promise.all([
        this.clusterService.getTags(),
        this.clusterService.getAscendancies(),
      ]);
      this.tagOptions.set(tags);
      this.ascendancyGroups.set(ascendancies);
    } catch {
      // fall back to empty — UI just won't show tags or ascendancy filter
    }
  }

  readonly elementQuery = signal('');
  readonly elementResults = signal<Element[]>([]);
  readonly searchOpen = signal(false);

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  get filters() { return this.store.filters(); }

  setFacet(value: string | null): void {
    this.store.updateFilter({ facet: value });
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

  setAscendancy(value: string): void {
    this.store.updateFilter({ ascendancyClass: value || null });
  }

  toggleTag(tag: string): void {
    const current = this.filters.tags;
    const next = current.includes(tag)
      ? current.filter(t => t !== tag)
      : [...current, tag];
    this.store.updateFilter({ tags: next });
  }

  isTagActive(tag: string): boolean {
    return this.filters.tags.includes(tag);
  }

  onElementInput(value: string): void {
    this.elementQuery.set(value);
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    if (value.length < 2) {
      this.elementResults.set([]);
      this.searchOpen.set(false);
      return;
    }
    this.debounceTimer = setTimeout(async () => {
      const results = await firstValueFrom(
        this.http.get<Element[]>(`${environment.apiBase}/elements/search`, {
          params: { q: value },
        }),
      );
      this.elementResults.set(results);
      this.searchOpen.set(results.length > 0);
    }, 250);
  }

  selectElement(el: Element): void {
    this.store.updateFilter({ elementId: el._id, elementName: el.name });
    this.elementQuery.set('');
    this.elementResults.set([]);
    this.searchOpen.set(false);
  }

  clearElement(): void {
    this.store.updateFilter({ elementId: null, elementName: null });
  }

  closeDropdown(): void {
    this.searchOpen.set(false);
  }
}
