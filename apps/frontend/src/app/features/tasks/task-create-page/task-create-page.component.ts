import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { UiDashboardWrapperComponent } from '@freelance-platform/ui';
import { AppHeaderComponent } from '../../../app-header/app-header.component';
import { DashboardSidebarComponent } from '../../../dashboard/dashboard-sidebar/dashboard-sidebar.component';
import { TaskCreateContainerComponent } from '../task-create-container/task-create-container.component';
import { TaskCreateFormComponent } from '../task-create-form/task-create-form.component';

@Component({
  selector: 'app-task-create-page',
  imports: [
    RouterLink,
    UiDashboardWrapperComponent,
    AppHeaderComponent,
    DashboardSidebarComponent,
    TaskCreateContainerComponent,
    TaskCreateFormComponent,
  ],
  templateUrl: './task-create-page.component.html',
  styleUrl: './task-create-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskCreatePageComponent {
  private readonly router = inject(Router);

  protected onCancel(): void {
    this.router.navigate(['/analytics']);
  }
}
