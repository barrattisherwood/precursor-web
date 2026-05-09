import { Element } from './element.types';

export interface ClusterEdge {
  from: string;
  to: string;
  edge_type: string;
  weight: number;
  link?: Record<string, unknown>;
}

export interface SynergyCluster {
  _id: string;
  element_ids: (Element | string)[];
  facets_represented: string[];
  tags: string[];
  edges: ClusterEdge[];
  theoretical_score: number;
  usage_count: number;
  usage_pct: number;
  hidden_score: number;
  spirit_feasible: boolean;
  combo_gated: boolean;
  league_scoped: boolean;
  description: string;
  patch_version: string;
  computed_at: string;
  active: boolean;
}

export interface ClusterFilters {
  facet: string | null;
  spiritFeasible: boolean;
  leagueScoped: boolean;
  sortBy: 'hidden_score' | 'theoretical_score' | 'usage_pct';
  edgeType: 'keyword_overlap' | 'condition_chain' | null;
  tags: string[];
  elementId: string | null;
  elementName: string | null;
}

export interface ClustersResponse {
  clusters: SynergyCluster[];
  total: number;
}
