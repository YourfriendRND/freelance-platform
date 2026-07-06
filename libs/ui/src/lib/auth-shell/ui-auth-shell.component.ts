import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ui-auth-shell',
  templateUrl: './ui-auth-shell.component.html',
  styleUrl: './ui-auth-shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiAuthShellComponent {}
