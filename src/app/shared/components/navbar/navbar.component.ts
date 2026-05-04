import { Component, HostListener, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ElementService } from '../../services/element.service';
import { Element } from '../../types/element.types';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly elementService = inject(ElementService);
  private readonly router = inject(Router);

  readonly scrolled = signal(false);
  readonly menuOpen = signal(false);
  readonly searchQuery = signal('');
  readonly searchResults = signal<Element[]>([]);
  readonly searchOpen = signal(false);

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  @HostListener('window:scroll')
  onScroll(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.scrolled.set(window.scrollY > 24);
    }
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeSearch();
  }

  toggleMenu(): void {
    this.menuOpen.update(v => !v);
  }

  onSearchClick(event: Event): void {
    event.stopPropagation();
  }

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
    this.searchOpen.set(true);

    if (this.debounceTimer) clearTimeout(this.debounceTimer);

    if (!value.trim()) {
      this.searchResults.set([]);
      return;
    }

    this.debounceTimer = setTimeout(async () => {
      try {
        const results = await this.elementService.search(value.trim());
        this.searchResults.set(results);
      } catch {
        this.searchResults.set([]);
      }
    }, 200);
  }

  onSearchKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.closeSearch();
    } else if (event.key === 'Enter') {
      const first = this.searchResults()[0];
      if (first) this.selectResult(first);
    }
  }

  selectResult(el: Element): void {
    this.router.navigate(['/elements', el._id]);
    this.closeSearch();
    this.menuOpen.set(false);
  }

  private closeSearch(): void {
    this.searchOpen.set(false);
    this.searchQuery.set('');
    this.searchResults.set([]);
  }

  facetLabel(facet: string): string {
    const map: Record<string, string> = {
      skill_gem: 'skill',
      support_gem: 'support',
      passive_node: 'passive',
      ascendancy_node: 'ascendancy',
      item_affix: 'affix',
    };
    return map[facet] ?? facet;
  }
}
