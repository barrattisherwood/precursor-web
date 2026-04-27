import { Component, input } from '@angular/core';
import { ElementFacet } from '../../types/element.types';

@Component({
  selector: 'app-facet-chip',
  template: `<span class="chip" [class]="'chip--' + facetClass()">{{ label() }}</span>`,
  styleUrl: './facet-chip.component.scss',
})
export class FacetChipComponent {
  readonly facet = input.required<ElementFacet>();

  private readonly LABELS: Record<ElementFacet, string> = {
    skill_gem:       'Skill gem',
    support_gem:     'Support gem',
    passive_node:    'Passive',
    ascendancy_node: 'Ascendancy',
    item_affix:      'Item affix',
  };

  private readonly CLASS_MAP: Record<ElementFacet, string> = {
    skill_gem:       'skill',
    support_gem:     'support',
    passive_node:    'passive',
    ascendancy_node: 'ascendancy',
    item_affix:      'affix',
  };

  label()      { return this.LABELS[this.facet()]; }
  facetClass() { return this.CLASS_MAP[this.facet()]; }
}
