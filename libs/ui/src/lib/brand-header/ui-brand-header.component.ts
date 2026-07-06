import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'ui-brand-header',
  templateUrl: './ui-brand-header.component.html',
  styleUrl: './ui-brand-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiBrandHeaderComponent {
  readonly brandName = input.required<string>();
  readonly title = input.required<string>();
  readonly subtitle = input.required<string>();
}
