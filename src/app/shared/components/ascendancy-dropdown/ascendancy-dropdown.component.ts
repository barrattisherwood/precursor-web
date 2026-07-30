import { Component, ElementRef, HostListener, inject, input, output, signal } from '@angular/core';

interface AscendancyOption { id: string; name: string; }
interface AscendancyGroup {
  base_class: string;
  ascendancies: AscendancyOption[];
}

@Component({
  selector: 'app-ascendancy-dropdown',
  standalone: true,
  templateUrl: './ascendancy-dropdown.component.html',
  styleUrl: './ascendancy-dropdown.component.scss',
})
export class AscendancyDropdownComponent {
  private readonly elementRef = inject(ElementRef);

  readonly groups = input.required<AscendancyGroup[]>();
  readonly selectedId = input<string | null>(null);
  readonly selectionChanged = output<string | null>();

  readonly isOpen = signal(false);

  selectedLabel(): string {
    const id = this.selectedId();
    if (!id) return 'All Ascendancies';
    for (const group of this.groups()) {
      const found = group.ascendancies.find(a => a.id === id);
      if (found) return found.name;
    }
    return 'All Ascendancies';
  }

  toggle(): void { this.isOpen.update(v => !v); }
  close(): void { this.isOpen.set(false); }

  select(id: string | null): void {
    this.selectionChanged.emit(id);
    this.close();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.isOpen()) return;
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.close();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close();
  }
}
