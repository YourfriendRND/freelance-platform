import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { AuthStore } from '@freelance-platform/client-state';
import {
  UiDashboardNavItem,
  UiDashboardSidebarComponent,
} from '@freelance-platform/ui';

enum DashboardSidebarItem {
  Analytics = 'analytics',
  Tasks = 'tasks',
  Profile = 'profile',
}

type DashboardSidebarActiveItem = Lowercase<keyof typeof DashboardSidebarItem>;

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
    const activeItem = this.activeItem();
    const isAuthenticated = this.authStore.isAuthenticated();
    const tasksItem: UiDashboardNavItem = {
      label: 'Задачи',
      href: '/tasks',
      icon: 'list',
      active: activeItem === DashboardSidebarItem.Tasks,
    };

    if (isAuthenticated) {
      return [
        {
          label: 'Аналитика',
          href: '/analytics',
          icon: 'grid',
          active: activeItem === DashboardSidebarItem.Analytics,
        },
        tasksItem,
        {
          label: 'Профиль',
          href: '/profile',
          icon: 'user',
          active: activeItem === DashboardSidebarItem.Profile,
        },
      ];
    }

    return [tasksItem];
  });
}
