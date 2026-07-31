import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ClusterReviewVerdict,
  QueueQuery,
  ReviewQueueResponse,
  ReviewSummaryResponse,
  VerdictPayload,
} from './review.types';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBase;

  private get headers(): HttpHeaders {
    return new HttpHeaders({ 'x-admin-secret': environment.adminSecret });
  }

  getQueue(query: QueueQuery): Promise<ReviewQueueResponse> {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null) {
        params = params.set(key, String(value));
      }
    }
    return firstValueFrom(
      this.http.get<ReviewQueueResponse>(`${this.base}/review/queue`, {
        headers: this.headers,
        params,
      }),
    );
  }

  submitVerdict(payload: VerdictPayload): Promise<ClusterReviewVerdict> {
    return firstValueFrom(
      this.http.post<ClusterReviewVerdict>(`${this.base}/review/verdict`, payload, {
        headers: this.headers,
      }),
    );
  }

  getSummary(): Promise<ReviewSummaryResponse> {
    return firstValueFrom(
      this.http.get<ReviewSummaryResponse>(`${this.base}/review/summary`, {
        headers: this.headers,
      }),
    );
  }
}
