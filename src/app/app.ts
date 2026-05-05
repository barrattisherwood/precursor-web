import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, NavbarComponent],
  template: `
    <app-navbar />
    <router-outlet />
    <footer class="site-footer">
      <div class="footer-inner">
        <p class="footer-disclaimer">
          Path of Exile 2 is developed and published by Grinding Gear Games.
          Precursor.nexus is an unofficial fan site and is not affiliated with or endorsed by Grinding Gear Games.
          All game assets, data, and trademarks are the property of their respective owners.
        </p>
        <div class="footer-links">
          <a routerLink="/about">About</a>
          <span class="footer-sep">·</span>
          <a href="https://www.pathofexile.com" target="_blank" rel="noopener">pathofexile.com</a>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .site-footer {
      border-top: 1px solid var(--c-border);
      margin-top: 80px;
      padding: 32px 24px;
    }
    .footer-inner {
      max-width: 900px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 12px;
      align-items: center;
      text-align: center;
    }
    .footer-disclaimer {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      color: var(--c-text-muted);
      letter-spacing: 0.04em;
      line-height: 1.7;
      max-width: 640px;
      opacity: 0.6;
    }
    .footer-links {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--c-text-muted);
      display: flex;
      gap: 8px;
      align-items: center;
      opacity: 0.5;
    }
    .footer-links a {
      color: inherit;
      text-decoration: none;
      transition: opacity 200ms ease;
      &:hover { opacity: 1; }
    }
    .footer-sep { opacity: 0.4; }
  `],
})
export class App {}
