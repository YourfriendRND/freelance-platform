import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthStore } from '@freelance-platform/client-state';
import { UiButtonComponent, UiDashboardWrapperComponent } from '@freelance-platform/ui';
import { AppHeaderComponent } from '../../../app-header/app-header.component';
import { DashboardSidebarComponent } from '../../../dashboard/dashboard-sidebar/dashboard-sidebar.component';
import { AnalyticsPageContainerComponent } from '../analytics-page-container/analytics-page-container.component';

@Component({
  selector: 'app-analytics-page',
  imports: [
    UiDashboardWrapperComponent,
    AppHeaderComponent,
    DashboardSidebarComponent,
    UiButtonComponent,
    AnalyticsPageContainerComponent,
  ],
  templateUrl: './analytics-page.component.html',
  styleUrl: './analytics-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnalyticsPageComponent {
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);

  protected readonly userName = computed(() => {
    const user = this.authStore.user();

    if (!user) {
      return '';
    }

    const { firstName, lastName } = user;

    return [firstName, lastName].filter(Boolean).join(' ');
  });

  protected readonly greeting = computed(() => {
    const name = this.userName();

    return name ? `С возвращением, ${name}!` : 'С возвращением!';
  });

  protected onCreateTask(): void {
    this.router.navigate(['/tasks/create']);
  }

}
