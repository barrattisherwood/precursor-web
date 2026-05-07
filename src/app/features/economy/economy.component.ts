import { Component, OnInit, inject, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface CurrencyRate {
  currency_id: string;
  chaos_value: number;
  source: string;
}

interface EconomySnapshot {
  captured_at: string;
  league: string;
  patch_version: string;
  currency_rates: CurrencyRate[];
}

@Component({
  selector: 'app-economy',
  imports: [],
  templateUrl: './economy.component.html',
  styleUrl: './economy.component.scss',
})
export class EconomyComponent implements OnInit {
  private readonly title = inject(Title);
  private readonly http = inject(HttpClient);

  readonly snapshot = signal<EconomySnapshot | null>(null);
  readonly loading = signal(true);
  readonly unavailable = signal(false);

  ngOnInit(): void {
    this.title.setTitle('Economy — Precursor.nexus');
    this.http.get<EconomySnapshot>(`${environment.apiBase}/economy/current`).subscribe({
      next: data => {
        this.snapshot.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.unavailable.set(true);
        this.loading.set(false);
      },
    });
  }

  formatCaptured(iso: string): string {
    return new Date(iso).toLocaleString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
      timeZone: 'UTC', timeZoneName: 'short',
    });
  }
}
