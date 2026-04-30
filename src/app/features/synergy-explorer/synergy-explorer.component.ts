import { Component, OnInit, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ExplorerStore } from '../../shared/state/explorer.store';
import { ElementService } from '../../shared/services/element.service';
import { Element } from '../../shared/types/element.types';
import { D3GraphComponent } from './d3-graph/d3-graph.component';
import { FacetChipComponent } from '../../shared/components/facet-chip/facet-chip.component';
import { GraphNode } from './d3-graph/d3-graph.service';

@Component({
  selector: 'app-synergy-explorer',
  imports: [FormsModule, RouterLink, D3GraphComponent, FacetChipComponent],
  templateUrl: './synergy-explorer.component.html',
  styleUrl: './synergy-explorer.component.scss',
})
export class SynergyExplorerComponent implements OnInit {
  private readonly platformId = inject(PLATFORM_ID);
  readonly store = inject(ExplorerStore);
  private readonly elementService = inject(ElementService);
  private readonly title = inject(Title);
  private readonly route = inject(ActivatedRoute);

  readonly searchQuery = signal('');
  readonly searchResults = signal<Element[]>([]);
  readonly searching = signal(false);

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.title.setTitle('Synergy Explorer — Precursor');
  }

  ngOnInit(): void {
    const id = this.route.snapshot.queryParamMap.get('id');
    if (id && isPlatformBrowser(this.platformId)) {
      this.store.pivot(id);
    }
  }

  get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  onSearch(): void {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    const q = this.searchQuery();
    if (q.length < 2) { this.searchResults.set([]); return; }
    this.debounceTimer = setTimeout(() => this.runSearch(q), 250);
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this.searchResults.set([]);
  }

  private async runSearch(q: string): Promise<void> {
    this.searching.set(true);
    try {
      const results = await this.elementService.search(q);
      this.searchResults.set(results.slice(0, 8));
    } finally {
      this.searching.set(false);
    }
  }

  selectElement(el: Element): void {
    this.searchQuery.set(el.name);
    this.searchResults.set([]);
    this.store.pivot(el._id);
  }

  onNodeClicked(node: GraphNode): void {
    this.store.pivot(node.id);
    this.searchQuery.set(node.name);
    this.searchResults.set([]);
  }
}
