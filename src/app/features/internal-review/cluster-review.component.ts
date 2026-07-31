import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ReviewService } from './review.service';
import {
  MechanicallyAccurate,
  QueueQuery,
  ReviewQueueCluster,
  ReviewSummaryResponse,
  ScoreFeel,
  VerdictPayload,
  YesNo,
} from './review.types';

type BatchKey = 'top' | 'middle' | 'marginal' | 'unreviewed' | 'reviewed';

const BATCHES: Record<BatchKey, { label: string; query: QueueQuery }> = {
  top: { label: 'Top Scored', query: { sort: 'hidden_score', limit: 15, reviewed: 'false' } },
  middle: { label: 'Middle Band', query: { sort: 'hidden_score', limit: 20, reviewed: 'false', min_score: 0.5, max_score: 0.6 } },
  marginal: { label: 'Marginal Cases', query: { sort: 'hidden_score', limit: 20, reviewed: 'false', min_score: 0.35, max_score: 0.4 } },
  unreviewed: { label: 'All Unreviewed', query: { sort: 'hidden_score', limit: 50, reviewed: 'false' } },
  reviewed: { label: 'Already Reviewed', query: { sort: 'hidden_score', limit: 50, reviewed: 'true' } },
};

@Component({
  selector: 'app-cluster-review',
  standalone: true,
  templateUrl: './cluster-review.component.html',
  styleUrl: './cluster-review.component.scss',
})
export class ClusterReviewComponent implements OnInit {
  private readonly review = inject(ReviewService);

  readonly batches = BATCHES;
  readonly batchKeys = Object.keys(BATCHES) as BatchKey[];

  readonly mode = signal<'queue' | 'summary'>('queue');
  readonly activeBatch = signal<BatchKey>('top');
  readonly clusters = signal<ReviewQueueCluster[]>([]);
  readonly total = signal(0);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly summary = signal<ReviewSummaryResponse | null>(null);

  ngOnInit(): void {
    this.loadBatch('top');
  }

  setMode(mode: 'queue' | 'summary'): void {
    this.mode.set(mode);
    if (mode === 'summary' && !this.summary()) {
      this.loadSummary();
    }
  }

  async loadBatch(key: BatchKey): Promise<void> {
    this.activeBatch.set(key);
    this.loading.set(true);
    this.error.set(null);
    try {
      const result = await this.review.getQueue(this.batches[key].query);
      this.clusters.set(result.clusters);
      this.total.set(result.total);
    } catch (err) {
      this.error.set(this.describeError(err));
      this.clusters.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  async loadSummary(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      this.summary.set(await this.review.getSummary());
    } catch (err) {
      this.error.set(this.describeError(err));
    } finally {
      this.loading.set(false);
    }
  }

  async setMechanicallyAccurate(cluster: ReviewQueueCluster, value: MechanicallyAccurate): Promise<void> {
    await this.applyVerdict(cluster, { mechanically_accurate: value });
  }

  async setNonObvious(cluster: ReviewQueueCluster, value: YesNo): Promise<void> {
    await this.applyVerdict(cluster, { non_obvious: value });
  }

  async setBuildable(cluster: ReviewQueueCluster, value: YesNo): Promise<void> {
    await this.applyVerdict(cluster, { buildable: value });
  }

  async setScoreFeel(cluster: ReviewQueueCluster, value: ScoreFeel): Promise<void> {
    await this.applyVerdict(cluster, { score_feels_right: value });
  }

  async saveNote(cluster: ReviewQueueCluster, value: string): Promise<void> {
    if ((cluster.verdict?.note ?? '') === value) return;
    await this.applyVerdict(cluster, { note: value });
  }

  private async applyVerdict(
    cluster: ReviewQueueCluster,
    partial: Omit<VerdictPayload, 'cluster_id'>,
  ): Promise<void> {
    try {
      const verdict = await this.review.submitVerdict({ cluster_id: cluster._id, ...partial });
      this.clusters.update(list =>
        list.map(c => (c._id === cluster._id ? { ...c, verdict } : c)),
      );
      this.error.set(null);
    } catch (err) {
      this.error.set(this.describeError(err));
    }
  }

  private describeError(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      if (err.status === 401) return 'Unauthorized — check the admin secret in your environment config.';
      if (err.status === 404) return 'Not found — cluster may no longer exist.';
      return `Request failed (${err.status}).`;
    }
    return 'Request failed.';
  }
}
