import { Injectable } from '@angular/core';
import * as d3 from 'd3';

export interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  facet: string;
  weight: number;
  nodeType?: 'element' | 'cluster';
  // Element tooltip data
  keywords?: string[];
  scales_keywords?: string[];
  stat_lines?: string[];
  spirit_cost?: number | null;
  gem_tags?: string[];
  // Cluster tooltip data
  description?: string;
  tags?: string[];
  hidden_score?: number;
  usage_pct?: number;
  spirit_feasible?: boolean;
  facet_counts?: Record<string, number>;
  element_names?: string[];
}

export interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  edge_type: string;
  weight: number;
}

@Injectable()
export class D3GraphService {
  private svg!: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  private simulation!: d3.Simulation<GraphNode, GraphLink>;
  private tooltip!: HTMLElement;
  private FACET_COLOURS: Record<string, string> = {};
  private EDGE_COLOURS: Record<string, string> = {};
  private FACET_LABELS: Record<string, string> = {
    skill_gem: 'Skill Gem',
    support_gem: 'Support Gem',
    passive_node: 'Passive',
    ascendancy_node: 'Ascendancy',
    item_affix: 'Item Affix',
    unique_item: 'Unique Item',
  };

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
      unique_item:     this.getCSSVar('--c-facet-affix'),
    };
    this.EDGE_COLOURS = {
      keyword_overlap:         this.getCSSVar('--c-edge-keyword'),
      condition_chain:         this.getCSSVar('--c-edge-condition'),
      stat_multiplication:     this.getCSSVar('--c-edge-multiplication'),
      condition_amplification: this.getCSSVar('--c-edge-amplification'),
      cluster_membership:      this.getCSSVar('--c-border-hover'),
    };
  }

  private createTooltip(container: HTMLElement): void {
    const existing = container.querySelector('.graph-tooltip');
    if (existing) existing.remove();
    const el = document.createElement('div');
    el.className = 'graph-tooltip';
    el.style.cssText = `
      position: absolute;
      pointer-events: none;
      display: none;
      background: var(--c-surface);
      border: 1px solid var(--c-border-hover);
      padding: 12px 14px;
      max-width: 260px;
      z-index: 100;
      font-family: var(--font-data, monospace);
      font-size: 11px;
      line-height: 1.5;
      color: var(--c-text-secondary);
    `;
    container.appendChild(el);
    this.tooltip = el;
  }

  private showTooltip(event: MouseEvent, node: GraphNode): void {
    this.tooltip.innerHTML = node.nodeType === 'cluster'
      ? this.clusterTooltipHtml(node)
      : this.elementTooltipHtml(node);
    this.tooltip.style.display = 'block';
    this.positionTooltip(event);
  }

  private positionTooltip(event: MouseEvent): void {
    const container = this.tooltip.parentElement!;
    const rect = container.getBoundingClientRect();
    const x = event.clientX - rect.left + 14;
    const y = event.clientY - rect.top - 10;
    const overflowX = x + 260 - container.clientWidth;
    this.tooltip.style.left = `${overflowX > 0 ? x - 274 : x}px`;
    this.tooltip.style.top = `${y}px`;
  }

  private hideTooltip(): void {
    this.tooltip.style.display = 'none';
  }

  private elementTooltipHtml(n: GraphNode): string {
    const facetLabel = this.FACET_LABELS[n.facet] ?? n.facet;
    const facetColour = this.FACET_COLOURS[n.facet] ?? '#999';
    let html = `
      <div style="margin-bottom:6px">
        <span style="color:${facetColour};text-transform:uppercase;font-size:9px;letter-spacing:0.08em">${facetLabel}</span>
        <div style="color:var(--c-text-primary);font-size:13px;font-weight:500;margin-top:2px">${n.name}</div>
      </div>`;

    if (n.keywords?.length) {
      html += `<div style="margin-bottom:4px"><span style="color:var(--c-text-muted)">Is · </span>${n.keywords.join(' · ')}</div>`;
    }
    if (n.scales_keywords?.length) {
      html += `<div style="margin-bottom:4px"><span style="color:var(--c-ash)">Scales · </span>${n.scales_keywords.join(' · ')}</div>`;
    }
    if (n.spirit_cost) {
      html += `<div style="margin-bottom:4px;color:var(--c-text-muted)">Spirit: ${n.spirit_cost}</div>`;
    }
    if (n.stat_lines?.length) {
      html += `<div style="border-top:1px solid var(--c-border);margin-top:6px;padding-top:6px;color:var(--c-text-muted)">`;
      html += n.stat_lines.slice(0, 3).map(l => `<div>· ${l}</div>`).join('');
      html += `</div>`;
    }
    return html;
  }

  private clusterTooltipHtml(n: GraphNode): string {
    const score = n.hidden_score != null ? n.hidden_score.toFixed(3) : '—';
    const usage = n.usage_pct != null
      ? (n.usage_pct * 100 < 0.1 ? '< 0.1%' : `${(n.usage_pct * 100).toFixed(1)}%`)
      : '—';

    let html = `
      <div style="margin-bottom:6px">
        <span style="color:var(--c-text-muted);font-size:9px;text-transform:uppercase;letter-spacing:0.08em">Cluster</span>
        <div style="color:var(--c-text-primary);font-size:13px;font-weight:500;margin-top:2px">${n.name}</div>
      </div>`;

    if (n.description) {
      html += `<div style="margin-bottom:8px;color:var(--c-text-secondary);font-size:11px">${n.description}</div>`;
    }

    if (n.element_names?.length) {
      html += `<div style="border-top:1px solid var(--c-border);padding-top:6px;margin-bottom:6px">`;
      html += n.element_names.map(name => `<div style="color:var(--c-text-muted)">· ${name}</div>`).join('');
      html += `</div>`;
    }

    if (n.facet_counts && Object.keys(n.facet_counts).length) {
      const parts = Object.entries(n.facet_counts)
        .map(([f, c]) => `${c} ${(this.FACET_LABELS[f] ?? f).toLowerCase()}`)
        .join(' · ');
      html += `<div style="margin-bottom:6px;color:var(--c-text-muted)">${parts}</div>`;
    }

    if (n.tags?.length) {
      html += `<div style="margin-bottom:6px">${n.tags.slice(0, 6).join(' · ')}</div>`;
    }

    html += `<div style="border-top:1px solid var(--c-border);padding-top:6px;display:flex;gap:12px;color:var(--c-text-muted)">
      <span>Score ${score}</span>
      <span>⚡ ${usage} ladder</span>
      ${n.spirit_feasible ? '<span style="color:var(--c-ash)">Spirit ✓</span>' : ''}
    </div>`;

    return html;
  }

  initialise(container: HTMLElement, nodes: GraphNode[], links: GraphLink[]): void {
    this.destroy();
    this.buildColourMaps();
    this.createTooltip(container);

    const width = container.clientWidth;
    const height = container.clientHeight;

    this.svg = d3.select(container).append('svg')
      .attr('width', width)
      .attr('height', height)
      .style('background', 'radial-gradient(ellipse at center, #110f0d 0%, #0a0907 100%)')
      .style('border', '1px solid var(--c-border)');

    const g = this.svg.append('g');

    this.svg.call(
      d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.3, 3])
        .on('zoom', ({ transform }) => g.attr('transform', transform)),
    );

    const pivotId = nodes.find(n => n.weight >= 1.0)?.id;

    // Radial pre-position: cluster nodes in a ring, element nodes scattered
    const clusterNodes = nodes.filter(n => n.nodeType === 'cluster');
    const otherNodes = nodes.filter(n => n.nodeType !== 'cluster' && n.id !== pivotId);
    const angleStep = clusterNodes.length > 0
      ? (2 * Math.PI) / clusterNodes.length
      : (2 * Math.PI) / Math.max(nodes.length, 1);
    const ringRadius = Math.min(width, height) * 0.32;

    const nodesCopy: GraphNode[] = nodes.map((n) => {
      if (n.id === pivotId) return { ...n, x: width / 2, y: height / 2 };
      const clusterIdx = clusterNodes.indexOf(n);
      if (clusterIdx >= 0) {
        const angle = clusterIdx * (2 * Math.PI) / clusterNodes.length - Math.PI / 2;
        return { ...n, x: width / 2 + ringRadius * Math.cos(angle), y: height / 2 + ringRadius * Math.sin(angle) };
      }
      const idx = otherNodes.indexOf(n);
      const angle = idx * angleStep;
      return { ...n, x: width / 2 + (ringRadius * 1.6) * Math.cos(angle), y: height / 2 + (ringRadius * 1.6) * Math.sin(angle) };
    });
    const linksCopy = links.map(l => ({ ...l }));

    const isClusterView = clusterNodes.length > 0;

    this.simulation = d3.forceSimulation(nodesCopy)
      .alpha(isClusterView ? 0.2 : 0.4)
      .alphaDecay(isClusterView ? 0.06 : 0.04)
      .force('link', d3.forceLink<GraphNode, GraphLink>(linksCopy).id(d => d.id)
        .distance(() => isClusterView ? ringRadius * 0.9 : 120)
        .strength(isClusterView ? 0.05 : 1))
      .force('charge', d3.forceManyBody().strength(isClusterView ? -600 : -300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide(isClusterView ? 60 : 40));

    // Fix pivot to centre in cluster view
    if (isClusterView) {
      const pivot = nodesCopy.find(n => n.id === pivotId);
      if (pivot) { pivot.fx = width / 2; pivot.fy = height / 2; }
    }

    const link = g.append('g').selectAll('line')
      .data(linksCopy).join('line')
      .attr('stroke', d => this.EDGE_COLOURS[d.edge_type] ?? '#555')
      .attr('stroke-opacity', d => isClusterView ? 0.25 : 0.3 + d.weight * 0.7)
      .attr('stroke-width', d => isClusterView ? 1 : 1 + d.weight * 3)
      .attr('stroke-dasharray', d => d.edge_type === 'cluster_membership' ? '4 3' : null);

    const node = g.append('g').selectAll('circle')
      .data(nodesCopy).join('circle')
      .attr('r', d => {
        if (d.id === pivotId) return 22;
        if (d.nodeType === 'cluster') return 18 + (d.hidden_score ?? 0) * 14;
        return d.weight >= 0.4 ? 14 : 9;
      })
      .attr('fill', d => {
        if (d.id === pivotId) return 'transparent';
        if (d.nodeType === 'cluster') return '#ffffff08';
        return (this.FACET_COLOURS[d.facet] ?? '#999') + '22';
      })
      .attr('stroke', d => {
        if (d.id === pivotId) return this.getCSSVar('--c-gold');
        if (d.nodeType === 'cluster') return this.getCSSVar('--c-ash');
        return this.FACET_COLOURS[d.facet] ?? '#999';
      })
      .attr('stroke-width', d => d.id === pivotId ? 2 : d.nodeType === 'cluster' ? 1.5 : 1)
      .attr('stroke-dasharray', d => d.nodeType === 'cluster' ? '5 3' : null)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .call(this.drag() as any)
      .on('click', (_, d) => this.onNodeClick(d))
      .on('mouseenter', (event: MouseEvent, d) => this.showTooltip(event, d))
      .on('mousemove', (event: MouseEvent) => this.positionTooltip(event))
      .on('mouseleave', () => this.hideTooltip());

    // Permanent labels: pivot + cluster nodes
    const labelNodes = nodesCopy.filter(n => n.id === pivotId || n.nodeType === 'cluster');
    const label = g.append('g').selectAll('text.fixed-label')
      .data(labelNodes).join('text')
      .text(d => d.name.length > 22 ? d.name.slice(0, 20) + '…' : d.name)
      .attr('font-size', d => d.nodeType === 'cluster' ? 10 : 12)
      .attr('font-weight', d => d.id === pivotId ? 'bold' : 'normal')
      .attr('text-anchor', 'middle')
      .attr('fill', d => d.id === pivotId ? this.getCSSVar('--c-gold') : this.getCSSVar('--c-text-secondary'))
      .attr('pointer-events', 'none');

    // Hover label for non-labelled nodes
    const hoverLabel = g.append('text')
      .attr('font-size', 11)
      .attr('text-anchor', 'middle')
      .attr('fill', this.getCSSVar('--c-text-secondary'))
      .attr('pointer-events', 'none')
      .style('display', 'none');

    node
      .on('mouseenter', (event: MouseEvent, d) => {
        this.showTooltip(event, d);
        if (d.id !== pivotId && d.nodeType !== 'cluster') {
          hoverLabel.style('display', null).text(d.name);
        }
      })
      .on('mousemove', (event: MouseEvent) => this.positionTooltip(event))
      .on('mouseleave', () => { this.hideTooltip(); hoverLabel.style('display', 'none'); });

    this.simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as GraphNode).x!)
        .attr('y1', d => (d.source as GraphNode).y!)
        .attr('x2', d => (d.target as GraphNode).x!)
        .attr('y2', d => (d.target as GraphNode).y!);
      node.attr('cx', d => d.x!).attr('cy', d => d.y!);
      label.attr('x', d => d.x!).attr('y', d => d.y! + (d.id === pivotId ? 34 : (18 + (d.hidden_score ?? 0) * 14) + 14));
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
