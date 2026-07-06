import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ui-auth-card',
  templateUrl: './ui-auth-card.component.html',
  styleUrl: './ui-auth-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiAuthCardComponent {}
