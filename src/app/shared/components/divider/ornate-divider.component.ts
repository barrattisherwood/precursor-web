import { Component } from '@angular/core';

@Component({
  selector: 'app-divider',
  standalone: true,
  template: `
    <div class="ornate-divider">
      <span class="ornament">✦</span>
    </div>
  `,
  styleUrl: './ornate-divider.component.scss',
})
export class OrnateDividerComponent {}
