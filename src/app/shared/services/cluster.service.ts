import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ClustersResponse, ClusterFilters, SynergyCluster } from '../types/cluster.types';

@Injectable({ providedIn: 'root' })
export class ClusterService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBase;

  getClusters(filters: ClusterFilters, page = 0): Promise<ClustersResponse> {
    const params: Record<string, string> = {
      sort: filters.sortBy,
      limit: '20',
      offset: String(page * 20),
      league_scoped: String(filters.leagueScoped),
      min_elements: '3',
    };
    if (filters.facet) params['facet'] = filters.facet;
    if (filters.spiritFeasible) params['spirit_feasible'] = 'true';
    if (filters.edgeType) params['edge_type'] = filters.edgeType;
    if (filters.tags.length > 0) params['tags'] = filters.tags.join(',');
    if (filters.elementId) params['element_id'] = filters.elementId;
    if (filters.ascendancyClass) params['ascendancy_class'] = filters.ascendancyClass;

    return firstValueFrom(
      this.http.get<ClustersResponse>(`${this.base}/clusters`, { params }),
    );
  }

  getTags(): Promise<string[]> {
    return firstValueFrom(
      this.http.get<string[]>(`${this.base}/clusters/tags`),
    );
  }

  getAscendancies(): Promise<{ base_class: string; ascendancies: string[] }[]> {
    return firstValueFrom(
      this.http.get<{ base_class: string; ascendancies: string[] }[]>(`${this.base}/clusters/ascendancies`),
    );
  }

  getCluster(id: string): Promise<SynergyCluster> {
    return firstValueFrom(
      this.http.get<SynergyCluster>(`${this.base}/clusters/${id}`),
    );
  }

  getClustersForElement(elementId: string): Promise<ClustersResponse> {
    return firstValueFrom(
      this.http.get<ClustersResponse>(`${this.base}/clusters`, {
        params: { element_id: elementId, sort: 'hidden_score', limit: '20', offset: '0', league_scoped: 'false' },
      }),
    );
  }
}
