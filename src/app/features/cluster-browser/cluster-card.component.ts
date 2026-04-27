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

  get hiddenScore(): string {
    return this.cluster().hidden_score.toFixed(2);
  }
}
