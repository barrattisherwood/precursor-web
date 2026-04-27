import { Injectable } from '@angular/core';
import * as d3 from 'd3';

export interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  facet: string;
  weight: number;
}

export interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  edge_type: string;
  weight: number;
}

@Injectable()
export class D3GraphService {
  private svg!: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  private simulation!: d3.Simulation<GraphNode, GraphLink>;
  private FACET_COLOURS: Record<string, string> = {};
  private EDGE_COLOURS: Record<string, string> = {};

  onNodeClick: (node: GraphNode) => void = () => {};

  private getCSSVar(name: string): string {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  private buildColourMaps(): void {
    this.FACET_COLOURS = {
      skill_gem:       this.getCSSVar('--c-facet-skill'),
      support_gem:     this.getCSSVar('--c-facet-support'),
      passive_node:    this.getCSSVar('--c-facet-passive'),
      ascendancy_node: this.getCSSVar('--c-facet-ascendancy'),
      item_affix:      this.getCSSVar('--c-facet-affix'),
    };
    this.EDGE_COLOURS = {
      keyword_overlap:         this.getCSSVar('--c-edge-keyword'),
      condition_chain:         this.getCSSVar('--c-edge-condition'),
      stat_multiplication:     this.getCSSVar('--c-edge-multiplication'),
      condition_amplification: this.getCSSVar('--c-edge-amplification'),
    };
  }

  initialise(container: HTMLElement, nodes: GraphNode[], links: GraphLink[]): void {
    this.destroy();
    this.buildColourMaps();

    const width = container.clientWidth;
    const height = container.clientHeight;

    this.svg = d3.select(container).append('svg')
      .attr('width', width)
      .attr('height', height);

    const g = this.svg.append('g');

    this.svg.call(
      d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.3, 3])
        .on('zoom', ({ transform }) => g.attr('transform', transform)),
    );

    const nodesCopy = nodes.map(n => ({ ...n }));
    const linksCopy = links.map(l => ({ ...l }));

    this.simulation = d3.forceSimulation(nodesCopy)
      .force('link', d3.forceLink<GraphNode, GraphLink>(linksCopy).id(d => d.id).distance(120))
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide(40));

    const link = g.append('g').selectAll('line')
      .data(linksCopy).join('line')
      .attr('stroke', d => this.EDGE_COLOURS[d.edge_type] ?? '#999')
      .attr('stroke-opacity', d => 0.3 + d.weight * 0.7)
      .attr('stroke-width', d => 1 + d.weight * 3);

    const node = g.append('g').selectAll('circle')
      .data(nodesCopy).join('circle')
      .attr('r', d => d.weight >= 1.0 ? 24 : d.weight >= 0.4 ? 16 : 10)
      .attr('fill', d => this.FACET_COLOURS[d.facet] ?? '#ccc')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .call(this.drag() as any)
      .on('click', (_, d) => this.onNodeClick(d));

    g.append('g').selectAll('text')
      .data(nodesCopy).join('text')
      .text(d => d.name)
      .attr('font-size', 11)
      .attr('text-anchor', 'middle')
      .attr('dy', 30)
      .attr('fill', '#ccc')
      .attr('pointer-events', 'none');

    this.simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as GraphNode).x!)
        .attr('y1', d => (d.source as GraphNode).y!)
        .attr('x2', d => (d.target as GraphNode).x!)
        .attr('y2', d => (d.target as GraphNode).y!);
      node.attr('cx', d => d.x!).attr('cy', d => d.y!);
    });
  }

  private drag() {
    return d3.drag<SVGCircleElement, GraphNode>()
      .on('start', (event, d) => {
        if (!event.active) this.simulation.alphaTarget(0.3).restart();
        d.fx = d.x; d.fy = d.y;
      })
      .on('drag', (event, d) => { d.fx = event.x; d.fy = event.y; })
      .on('end', (event, d) => {
        if (!event.active) this.simulation.alphaTarget(0);
        d.fx = null; d.fy = null;
      });
  }

  destroy(): void {
    this.simulation?.stop();
    if (this.svg) {
      this.svg.selectAll('*').remove();
      (this.svg.node()?.parentElement)?.removeChild(this.svg.node()!);
    }
  }
}
