import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ui-auth-container',
  templateUrl: './ui-auth-container.component.html',
  styleUrl: './ui-auth-container.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiAuthContainerComponent {}
