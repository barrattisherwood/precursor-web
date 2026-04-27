import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { ClusterService } from '../../shared/services/cluster.service';
import { SynergyCluster } from '../../shared/types/cluster.types';
import { Element } from '../../shared/types/element.types';
import { FacetChipComponent } from '../../shared/components/facet-chip/facet-chip.component';
import { ScoreBarComponent } from '../../shared/components/score-bar/score-bar.component';

@Component({
  selector: 'app-cluster-detail',
  imports: [FacetChipComponent, ScoreBarComponent, RouterLink],
  templateUrl: './cluster-detail.component.html',
  styleUrl: './cluster-detail.component.scss',
})
export class ClusterDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly clusterService = inject(ClusterService);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  readonly cluster = signal<SynergyCluster | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id')!;
    try {
      const c = await this.clusterService.getCluster(id);
      this.cluster.set(c);
      this.setMeta(c);
    } catch {
      this.error.set('Cluster not found.');
    } finally {
      this.loading.set(false);
    }
  }

  get elements(): Element[] {
    return (this.cluster()?.element_ids ?? []).filter(
      (e): e is Element => typeof e === 'object' && e !== null,
    );
  }

  get usagePct(): string {
    return ((this.cluster()?.usage_pct ?? 0) * 100).toFixed(1);
  }

  navigateToElement(id: string): void {
    this.router.navigate(['/elements', id]);
  }

  private setMeta(c: SynergyCluster): void {
    const desc = c.description.slice(0, 160);
    this.title.setTitle(`${c.description.slice(0, 60)} — Precursor`);
    this.meta.updateTag({ name: 'description', content: desc });
    this.meta.updateTag({ property: 'og:title', content: c.description });
    this.meta.updateTag({ property: 'og:description', content:
      `Hidden synergy score: ${c.hidden_score.toFixed(2)} · Used by ${(c.usage_pct * 100).toFixed(1)}% of top ladder builds` });
    this.meta.updateTag({ property: 'og:url', content: `https://precursor.nexus/clusters/${c._id}` });
    this.meta.updateTag({ property: 'og:site_name', content: 'Precursor' });
  }
}
