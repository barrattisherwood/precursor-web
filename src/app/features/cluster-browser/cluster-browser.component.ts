import { Component, OnInit, inject } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { ClusterStore } from '../../shared/state/cluster.store';
import { ClusterCardComponent } from './cluster-card.component';
import { ClusterFiltersComponent } from './cluster-filters.component';

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

  ngOnInit(): void {
    this.title.setTitle('Hidden Synergies — Precursor');
    this.meta.updateTag({ name: 'description', content: 'Discover underplayed build synergies in Path of Exile 2 — sorted by hidden score, not popularity.' });
    this.store.load();
  }
}
