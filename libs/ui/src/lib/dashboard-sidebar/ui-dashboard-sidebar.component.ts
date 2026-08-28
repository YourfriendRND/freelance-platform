import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

export type UiDashboardNavItem = {
  readonly label: string;
  readonly href: string;
  readonly active?: boolean;
};

@Component({
  selector: 'ui-dashboard-sidebar',
  templateUrl: './ui-dashboard-sidebar.component.html',
  styleUrl: './ui-dashboard-sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiDashboardSidebarComponent {
  readonly brandName = input('TaskFlow');
  readonly homeHref = input('/welcome');
  readonly items = input<readonly UiDashboardNavItem[]>([]);

  readonly homeClick = output<MouseEvent>();
  readonly itemClick = output<{ item: UiDashboardNavItem; event: MouseEvent }>();
}
