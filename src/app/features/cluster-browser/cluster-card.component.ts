import { Component, input } from '@angular/core';
import { Router } from '@angular/router';
import { SynergyCluster } from '../../shared/types/cluster.types';
import { Element } from '../../shared/types/element.types';
import { FacetChipComponent } from '../../shared/components/facet-chip/facet-chip.component';
import { ScoreBarComponent } from '../../shared/components/score-bar/score-bar.component';

@Component({
  selector: 'app-cluster-card',
  imports: [FacetChipComponent, ScoreBarComponent],
  templateUrl: './cluster-card.component.html',
  styleUrl: './cluster-card.component.scss',
})
export class ClusterCardComponent {
  readonly cluster = input.required<SynergyCluster>();

  constructor(private router: Router) {}

  navigate(): void {
    this.router.navigate(['/clusters', this.cluster()._id]);
  }

  get elements(): Element[] {
    return this.cluster().element_ids.filter(
      (e): e is Element => typeof e === 'object' && e !== null,
    );
  }

  get usagePct(): string {
    return (this.cluster().usage_pct * 100).toFixed(1);
  }

  get scoreBarHeight(): string {
    return `${Math.round(this.cluster().hidden_score * 100)}%`;
  }

  get hiddenScore(): string {
    return this.cluster().hidden_score.toFixed(2);
  }

  get tags(): string[] {
    return this.cluster().tags ?? [];
  }

  get facetCounts(): { facet: string; count: number }[] {
    const counts = new Map<string, number>();
    for (const f of this.cluster().facets_represented) {
      counts.set(f, (counts.get(f) ?? 0) + 1);
    }
    return [...counts.entries()].map(([facet, count]) => ({ facet, count }));
  }

  get edgeTypeLabel(): string {
    const edges = this.cluster().edges;
    if (edges.some(e => e.edge_type === 'condition_chain' || e.edge_type === 'condition_amplification')) {
      return 'Condition chain';
    }
    if (edges.some(e => e.edge_type === 'stat_multiplication')) {
      return 'Stat synergy';
    }
    return 'Keyword synergy';
  }
}
