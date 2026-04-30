import { Injectable, signal, inject } from '@angular/core';
import { ElementService } from '../services/element.service';
import { Element, SynergyEdge } from '../types/element.types';
import { GraphNode, GraphLink } from '../../features/synergy-explorer/d3-graph/d3-graph.service';

@Injectable({ providedIn: 'root' })
export class ExplorerStore {
  private readonly elementService = inject(ElementService);

  private readonly _centre = signal<Element | null>(null);
  private readonly _nodes = signal<GraphNode[]>([]);
  private readonly _links = signal<GraphLink[]>([]);
  private readonly _loading = signal(false);

  readonly centre = this._centre.asReadonly();
  readonly nodes = this._nodes.asReadonly();
  readonly links = this._links.asReadonly();
  readonly loading = this._loading.asReadonly();

  async pivot(elementId: string): Promise<void> {
    this._loading.set(true);
    try {
      const { element, edges } = await this.elementService.getElement(elementId);
      this._centre.set(element);

      // Build max edge weight per peer so stronger connections render larger
      const peerWeight = new Map<string, number>();
      const nodeMap = new Map<string, Element>();
      nodeMap.set(element._id, element);
      edges.forEach(edge => {
        const a = edge.element_a as Element;
        const b = edge.element_b as Element;
        if (a?._id) nodeMap.set(a._id, a);
        if (b?._id) nodeMap.set(b._id, b);
        const peerId = (a._id === element._id) ? b._id : a._id;
        if (peerId) peerWeight.set(peerId, Math.max(peerWeight.get(peerId) ?? 0, edge.weight));
      });

      const nodes: GraphNode[] = Array.from(nodeMap.values()).map(el => ({
        id: el._id,
        name: el.name,
        facet: el.facet,
        weight: el._id === element._id ? 1.0 : (peerWeight.get(el._id) ?? 0.1),
      }));

      const links: GraphLink[] = edges.map((edge: SynergyEdge) => ({
        source: (edge.element_a as Element)._id ?? String(edge.element_a),
        target: (edge.element_b as Element)._id ?? String(edge.element_b),
        edge_type: edge.edge_type,
        weight: edge.weight,
      }));

      this._nodes.set(nodes);
      this._links.set(links);
    } finally {
      this._loading.set(false);
    }
  }
}
