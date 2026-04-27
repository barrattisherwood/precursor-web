import { Component, OnInit, OnDestroy, OnChanges, ElementRef, ViewChild, input, output, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { D3GraphService, GraphNode, GraphLink } from './d3-graph.service';

@Component({
  selector: 'app-d3-graph',
  providers: [D3GraphService],
  template: `<div #container class="graph-container"></div>`,
  styles: [`
    .graph-container {
      width: 100%;
      height: 100%;
    }
  `],
})
export class D3GraphComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild('container', { static: true }) containerRef!: ElementRef<HTMLElement>;

  readonly nodes = input<GraphNode[]>([]);
  readonly links = input<GraphLink[]>([]);
  readonly nodeClicked = output<GraphNode>();

  private readonly platformId = inject(PLATFORM_ID);
  private readonly d3 = inject(D3GraphService);

  ngOnInit(): void {
    this.d3.onNodeClick = (node) => this.nodeClicked.emit(node);
    if (isPlatformBrowser(this.platformId)) {
      this.render();
    }
  }

  ngOnChanges(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.render();
    }
  }

  private render(): void {
    const n = this.nodes();
    const l = this.links();
    if (n.length > 0) {
      this.d3.initialise(this.containerRef.nativeElement, n, l);
    }
  }

  ngOnDestroy(): void {
    this.d3.destroy();
  }
}
