import { SynergyCluster } from '../../shared/types/cluster.types';

export type MechanicallyAccurate = 'yes' | 'no' | 'unsure';
export type YesNo = 'yes' | 'no';
export type ScoreFeel = 'too high' | 'about right' | 'too low';

export interface ClusterReviewVerdict {
  _id: string;
  cluster_id: string;
  mechanically_accurate: MechanicallyAccurate | null;
  non_obvious: YesNo | null;
  buildable: YesNo | null;
  score_feels_right: ScoreFeel | null;
  note: string | null;
  reviewed_by: string;
  reviewed_at: string;
  patch_version: string;
}

export interface ReviewQueueCluster extends SynergyCluster {
  verdict: ClusterReviewVerdict | null;
}

export interface ReviewQueueResponse {
  clusters: ReviewQueueCluster[];
  total: number;
}

export interface ReviewSummaryStats {
  total: number;
  mechanical_issues: number;
  too_obvious: number;
  unbuildable: number;
  score_mismatches: number;
}

export interface ReviewSummaryResponse {
  stats: ReviewSummaryStats;
  verdicts: ClusterReviewVerdict[];
}

export interface VerdictPayload {
  cluster_id: string;
  mechanically_accurate?: MechanicallyAccurate;
  non_obvious?: YesNo;
  buildable?: YesNo;
  score_feels_right?: ScoreFeel;
  note?: string;
}

export interface QueueQuery {
  sort?: string;
  limit?: number;
  offset?: number;
  reviewed?: 'true' | 'false';
  min_score?: number;
  max_score?: number;
}
