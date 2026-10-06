import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

export enum UiDashboardNavIcon {
  List = 'list',
  Grid = 'grid',
  User = 'user',
  File = 'file',
  Clipboard = 'clipboard',
}

export type UiDashboardNavItem = {
  readonly label: string;
  readonly href: string;
  readonly active?: boolean;
  readonly icon?: UiDashboardNavIcon;
};

@Component({
  selector: 'ui-dashboard-sidebar',
  imports: [RouterLink],
  templateUrl: './ui-dashboard-sidebar.component.html',
  styleUrl: './ui-dashboard-sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiDashboardSidebarComponent {
  protected readonly UiDashboardNavIcon = UiDashboardNavIcon;

  readonly brandName = input('TaskFlow');
  readonly homeHref = input('/welcome');
  readonly items = input<readonly UiDashboardNavItem[]>([]);

  readonly homeClick = output<MouseEvent>();
  readonly itemClick = output<{ item: UiDashboardNavItem; event: MouseEvent }>();
}
