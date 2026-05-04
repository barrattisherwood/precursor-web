export type ElementFacet =
  | 'skill_gem'
  | 'support_gem'
  | 'passive_node'
  | 'ascendancy_node'
  | 'item_affix';

export interface ElementMeta {
  gem_tags?: string[];
  max_level?: number;
  support_restricted_to?: string[];
  spirit_cost?: number;
  node_type?: string;
  ascendancy?: string;
  ascendancy_class?: string;
  affix_type?: string;
  tier?: number;
  league_mechanic?: string | null;
  stat_lines?: string[];
  description?: string;
}

export interface ElementStat {
  stat_id: string;
  value_min: number;
  value_max: number;
  modifier_type: string;
  condition: string | null;
}

export interface ElementProduces {
  condition: string;
  requirement: string;
  chance: number | null;
}

export interface Element {
  _id: string;
  source_id: string;
  name: string;
  facet: ElementFacet;
  meta: ElementMeta;
  keywords: string[];
  produces: ElementProduces[];
  stats: ElementStat[];
  scales_keywords: string[];
  scales_conditions: string[];
  scales_stats: string[];
  excluded_keywords: string[];
  combo_required: boolean;
  combo_produces: boolean;
  patch_version: string;
  source: string;
}

export interface SynergyEdge {
  _id: string;
  element_a: Element | string;
  element_b: Element | string;
  edge_type: string;
  weight: number;
  link?: Record<string, unknown>;
  patch_version: string;
}

export interface ElementWithEdges {
  element: Element;
  edges: SynergyEdge[];
}
