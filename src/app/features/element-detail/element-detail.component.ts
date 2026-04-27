import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { ElementService } from '../../shared/services/element.service';
import { Element, SynergyEdge } from '../../shared/types/element.types';
import { FacetChipComponent } from '../../shared/components/facet-chip/facet-chip.component';

@Component({
  selector: 'app-element-detail',
  imports: [FacetChipComponent, RouterLink],
  templateUrl: './element-detail.component.html',
  styleUrl: './element-detail.component.scss',
})
export class ElementDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly elementService = inject(ElementService);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  readonly element = signal<Element | null>(null);
  readonly edges = signal<SynergyEdge[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id')!;
    try {
      const { element, edges } = await this.elementService.getElement(id);
      this.element.set(element);
      this.edges.set(edges);
      this.title.setTitle(`${element.name} — Precursor`);
      this.meta.updateTag({ name: 'description', content:
        `${element.facet.replace('_', ' ')} · Keywords: ${element.keywords.join(', ')}` });
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
}
