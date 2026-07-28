import { Component, OnInit, inject, signal, computed, effect } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { ClusterStore } from '../../shared/state/cluster.store';
import { ClusterCardComponent } from './cluster-card.component';
import { ClusterFiltersComponent } from './cluster-filters.component';
import { ClusterFilters } from '../../shared/types/cluster.types';

@Component({
  selector: 'app-cluster-browser',
  imports: [ClusterCardComponent, ClusterFiltersComponent],
  templateUrl: './cluster-browser.component.html',
  styleUrl: './cluster-browser.component.scss',
})
export class ClusterBrowserComponent implements OnInit {
  readonly store = inject(ClusterStore);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  readonly clusterCount = signal(0);
  readonly sort = computed(() => this.store.filters().sortBy);

  private countAnimationTimer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    effect(() => {
      const target = this.store.total();
      this.animateCount(target);
    });
  }

  ngOnInit(): void {
    this.title.setTitle('Hidden Synergies — Precursor.nexus');
    this.meta.updateTag({ name: 'description', content: 'Discover underplayed build synergies in Path of Exile 2 — sorted by hidden score, not popularity.' });
    this.store.load();
  }

  setSort(value: ClusterFilters['sortBy']): void {
    this.store.updateFilter({ sortBy: value });
  }

  private animateCount(target: number): void {
    if (this.countAnimationTimer) clearInterval(this.countAnimationTimer);
    const duration = 800;
    const steps = 30;
    const start = this.clusterCount();
    const increment = (target - start) / steps;
    let current = start;
    let step = 0;
    this.countAnimationTimer = setInterval(() => {
      step++;
      current += increment;
      if (step >= steps) {
        this.clusterCount.set(target);
        if (this.countAnimationTimer) clearInterval(this.countAnimationTimer);
      } else {
        this.clusterCount.set(Math.round(current));
      }
    }, duration / steps);
  }
}
