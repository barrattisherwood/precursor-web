import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Element, ElementWithEdges } from '../types/element.types';
import { ElementClustersResponse } from '../types/cluster.types';

@Injectable({ providedIn: 'root' })
export class ElementService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBase;

  getElement(id: string): Promise<ElementWithEdges> {
    return firstValueFrom(
      this.http.get<ElementWithEdges>(`${this.base}/elements/${id}`),
    );
  }

  getElementClusters(id: string, limit = 12): Promise<ElementClustersResponse> {
    return firstValueFrom(
      this.http.get<ElementClustersResponse>(`${this.base}/elements/${id}/clusters`, { params: { limit: String(limit) } }),
    );
  }

  search(q: string, facet?: string): Promise<Element[]> {
    const params: Record<string, string> = { q };
    if (facet) params['facet'] = facet;

    return firstValueFrom(
      this.http.get<Element[]>(`${this.base}/elements/search`, { params }),
    );
  }
}
