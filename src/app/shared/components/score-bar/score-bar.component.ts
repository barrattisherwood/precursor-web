import { Component, input, computed } from '@angular/core';

@Component({
  selector: 'app-score-bar',
  template: `
    <div class="score-bar-track">
      <div class="score-bar-fill" [style.width.%]="pct()"></div>
    </div>
  `,
  styles: [`
    .score-bar-track {
      height: 1px;
      background: var(--c-border);
    }
    .score-bar-fill {
      height: 1px;
      background: linear-gradient(90deg, var(--c-gold-dim), var(--c-gold));
      transition: width 700ms cubic-bezier(0.4, 0, 0.2, 1);
    }
  `],
})
export class ScoreBarComponent {
  readonly score = input.required<number>();
  readonly pct   = computed(() => Math.round(this.score() * 100));
}
