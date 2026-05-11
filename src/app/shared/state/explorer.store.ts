import { Injectable, signal, inject } from '@angular/core';
import { ElementService } from '../services/element.service';
import { Element, SynergyEdge } from '../types/element.types';
import { SynergyCluster } from '../types/cluster.types';
import { GraphNode, GraphLink } from '../../features/synergy-explorer/d3-graph/d3-graph.service';

export type ExplorerViewMode = 'clusters' | 'graph';

@Injectable({ providedIn: 'root' })
export class ExplorerStore {
  private readonly elementService = inject(ElementService);

  private readonly _centre = signal<Element | null>(null);
  private readonly _nodes = signal<GraphNode[]>([]);
  private readonly _links = signal<GraphLink[]>([]);
  private readonly _loading = signal(false);
  private readonly _viewMode = signal<ExplorerViewMode>('clusters');
  private readonly _clusterCount = signal(0);

  readonly centre = this._centre.asReadonly();
  readonly nodes = this._nodes.asReadonly();
  readonly links = this._links.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly viewMode = this._viewMode.asReadonly();
  readonly clusterCount = this._clusterCount.asReadonly();

  async pivot(elementId: string): Promise<void> {
    this._loading.set(true);
    try {
      if (this._viewMode() === 'clusters') {
        await this.pivotClusters(elementId);
      } else {
        await this.pivotGraph(elementId);
      }
    } finally {
      this._loading.set(false);
    }
  }

  async setViewMode(mode: ExplorerViewMode): Promise<void> {
    this._viewMode.set(mode);
    const centre = this._centre();
    if (centre) await this.pivot(centre._id);
  }

  private async pivotClusters(elementId: string): Promise<void> {
    const [{ element, edges: _edges }, { clusters }] = await Promise.all([
      this.elementService.getElement(elementId),
      this.elementService.getElementClusters(elementId, 12),
    ]);
    this._centre.set(element);
    this._clusterCount.set(clusters.length);

    const centreNode: GraphNode = {
      id: element._id,
      name: element.name,
      facet: element.facet,
      weight: 1.0,
      nodeType: 'element',
      keywords: element.keywords,
      scales_keywords: element.scales_keywords,
      stat_lines: element.meta.stat_lines,
      spirit_cost: element.meta.spirit_cost,
      gem_tags: element.meta.gem_tags,
    };

    const clusterNodes: GraphNode[] = clusters.map((c: SynergyCluster) => {
      const elements = c.element_ids.filter((e): e is Element => typeof e === 'object');
      const facet_counts: Record<string, number> = {};
      for (const el of elements) {
        facet_counts[el.facet] = (facet_counts[el.facet] ?? 0) + 1;
      }
      const dominantFacet = Object.entries(facet_counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'passive_node';
      const otherElements = elements.filter(e => e._id !== elementId);
      const label = otherElements.length > 0
        ? otherElements.slice(0, 2).map(e => e.name).join(' + ')
        : c.description?.slice(0, 30) ?? 'Cluster';

      return {
        id: c._id,
        name: label,
        facet: dominantFacet,
        weight: c.hidden_score,
        nodeType: 'cluster',
        description: c.description,
        tags: c.tags,
        hidden_score: c.hidden_score,
        usage_pct: c.usage_pct,
        spirit_feasible: c.spirit_feasible,
        facet_counts,
        element_names: elements.map(e => e.name),
      };
    });

    const clusterLinks: GraphLink[] = clusters.map((c: SynergyCluster) => ({
      source: elementId,
      target: c._id,
      edge_type: 'cluster_membership',
      weight: c.hidden_score,
    }));

    this._nodes.set([centreNode, ...clusterNodes]);
    this._links.set(clusterLinks);
  }

  private async pivotGraph(elementId: string): Promise<void> {
    const { element, edges } = await this.elementService.getElement(elementId);
    this._centre.set(element);
    this._clusterCount.set(0);

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
      nodeType: 'element' as const,
      keywords: el.keywords,
      scales_keywords: el.scales_keywords,
      stat_lines: el.meta.stat_lines,
      spirit_cost: el.meta.spirit_cost,
      gem_tags: el.meta.gem_tags,
    }));

    const links: GraphLink[] = edges.map((edge: SynergyEdge) => ({
      source: (edge.element_a as Element)._id ?? String(edge.element_a),
      target: (edge.element_b as Element)._id ?? String(edge.element_b),
      edge_type: edge.edge_type,
      weight: edge.weight,
    }));

    this._nodes.set(nodes);
    this._links.set(links);
  }
}
