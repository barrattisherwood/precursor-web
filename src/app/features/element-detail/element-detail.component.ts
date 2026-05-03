import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { ElementService } from '../../shared/services/element.service';
import { ClusterService } from '../../shared/services/cluster.service';
import { Element, SynergyEdge } from '../../shared/types/element.types';
import { SynergyCluster } from '../../shared/types/cluster.types';
import { FacetChipComponent } from '../../shared/components/facet-chip/facet-chip.component';

@Component({
  selector: 'app-element-detail',
  imports: [FacetChipComponent, RouterLink],
  templateUrl: './element-detail.component.html',
  styleUrl: './element-detail.component.scss',
})
export class ElementDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly elementService = inject(ElementService);
  private readonly clusterService = inject(ClusterService);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  readonly element = signal<Element | null>(null);
  readonly edges = signal<SynergyEdge[]>([]);
  readonly clusters = signal<SynergyCluster[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id')!;
    try {
      const [{ element, edges }, clustersResult] = await Promise.all([
        this.elementService.getElement(id),
        this.clusterService.getClustersForElement(id),
      ]);
      this.element.set(element);
      this.edges.set(edges);
      this.clusters.set(clustersResult.clusters);
      this.title.setTitle(`${element.name} — Precursor`);
      this.meta.updateTag({ name: 'description', content:
        `${element.facet.replace(/_/g, ' ')} · Keywords: ${element.keywords.join(', ')}` });
    } catch {
      this.error.set('Element not found.');
    } finally {
      this.loading.set(false);
    }
  }

  peerElement(edge: SynergyEdge): Element | null {
    const el = this.element();
    if (!el) return null;
    const a = edge.element_a as Element;
    const b = edge.element_b as Element;
    return a._id === el._id ? b : a;
  }

  edgeDetail(edge: SynergyEdge): string {
    if (edge.edge_type === 'condition_chain' || edge.edge_type === 'condition_amplification') {
      const condition = edge.link?.['condition'] as string | undefined;
      return condition ? `via ${condition}` : '';
    }
    if (edge.edge_type === 'keyword_overlap') {
      const kws = edge.link?.['shared_keywords'] as string[] | undefined;
      return kws?.join(', ') ?? '';
    }
    return '';
  }

  edgeTypeClass(edgeType: string): string {
    return 'edge-type--' + edgeType.replace(/_/g, '-');
  }

  navigateToCluster(id: string): void {
    this.router.navigate(['/clusters', id]);
  }

  clusterEdgeLabel(cluster: SynergyCluster): string {
    if (cluster.edges.some(e => e.edge_type === 'condition_chain')) return 'condition chain';
    if (cluster.edges.some(e => e.edge_type === 'stat_multiplication')) return 'stat synergy';
    return 'keyword synergy';
  }

  clusterEdgeClass(cluster: SynergyCluster): string {
    if (cluster.edges.some(e => e.edge_type === 'condition_chain')) return 'edge-type--condition-chain';
    if (cluster.edges.some(e => e.edge_type === 'stat_multiplication')) return 'edge-type--stat-multiplication';
    return 'edge-type--keyword-overlap';
  }
}
