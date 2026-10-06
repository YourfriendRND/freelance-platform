import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { AuthStore } from '@freelance-platform/client-state';
import { UserRole } from '@freelance-platform/shared-types';
import {
  UiDashboardNavIcon,
  UiDashboardNavItem,
  UiDashboardSidebarComponent,
} from '@freelance-platform/ui';

enum DashboardSidebarItem {
  Analytics = 'analytics',
  Tasks = 'tasks',
  MyTasks = 'my-tasks',
  Applications = 'applications',
  Profile = 'profile',
}

type DashboardSidebarActiveItem = `${DashboardSidebarItem}`;

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
      icon: UiDashboardNavIcon.List,
      active: activeItem === DashboardSidebarItem.Tasks,
    };
    const profileItem: UiDashboardNavItem = {
      label: 'Профиль',
      href: '/profile',
      icon: UiDashboardNavIcon.User,
      active: activeItem === DashboardSidebarItem.Profile,
    };

    if (!isAuthenticated) {
      return [tasksItem];
    }

    const items: UiDashboardNavItem[] = [
      {
        label: 'Аналитика',
        href: '/analytics',
        icon: UiDashboardNavIcon.Grid,
        active: activeItem === DashboardSidebarItem.Analytics,
      },
      tasksItem,
    ];

    const role = this.authStore.user()?.role;

    if (role === UserRole.Freelancer) {
      items.push({
        label: 'Мои отклики',
        href: '/applications',
        icon: UiDashboardNavIcon.File,
        active: activeItem === DashboardSidebarItem.Applications,
      });
    }

    if (role === UserRole.Client) {
      items.push({
        label: 'Мои задачи',
        href: '/my-tasks',
        icon: UiDashboardNavIcon.Clipboard,
        active: activeItem === DashboardSidebarItem.MyTasks,
      });
    }

    items.push(profileItem);

    return items;
  });
}
