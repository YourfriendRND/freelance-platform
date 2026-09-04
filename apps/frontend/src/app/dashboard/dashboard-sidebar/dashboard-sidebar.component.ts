import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { AuthStore } from '@freelance-platform/client-state';
import {
  UiDashboardNavItem,
  UiDashboardSidebarComponent,
} from '@freelance-platform/ui';

type DashboardSidebarActiveItem = 'analytics' | 'tasks';

@Component({
  selector: 'app-dashboard-sidebar',
  imports: [UiDashboardSidebarComponent],
  templateUrl: './dashboard-sidebar.component.html',
  styleUrl: './dashboard-sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardSidebarComponent {
  readonly activeItem = input.required<DashboardSidebarActiveItem>();

  private readonly authStore = inject(AuthStore);

  protected readonly sidebarItems = computed<readonly UiDashboardNavItem[]>(() => {
    const items: UiDashboardNavItem[] = [];

    if (this.authStore.isAuthenticated()) {
      items.push({
        label: 'Аналитика',
        href: '/analytics',
        icon: 'grid',
        active: this.activeItem() === 'analytics',
      });
    }

    items.push({
      label: 'Задачи',
      href: '/tasks',
      icon: 'list',
      active: this.activeItem() === 'tasks',
    });

    return items;
  });
}
