import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ui-dashboard-wrapper',
  templateUrl: './ui-dashboard-wrapper.component.html',
  styleUrl: './ui-dashboard-wrapper.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiDashboardWrapperComponent {}
