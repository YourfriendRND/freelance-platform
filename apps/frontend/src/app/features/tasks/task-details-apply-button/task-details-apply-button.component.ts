import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { Router } from '@angular/router';
import { AuthStore, TaskApplicationStore } from '@freelance-platform/client-state';
import { TaskStatus, UserRole } from '@freelance-platform/shared-types';
import { UiButtonComponent } from '@freelance-platform/ui';

@Component({
  selector: 'app-task-details-apply-button',
  imports: [UiButtonComponent],
  templateUrl: './task-details-apply-button.component.html',
  styleUrl: './task-details-apply-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskDetailsApplyButtonComponent {
  readonly status = input.required<TaskStatus>();
  readonly taskId = input.required<string>();
  readonly taskHasApplied = input(false);

  readonly apply = output<void>();

  private readonly authStore = inject(AuthStore);
  private readonly taskApplicationStore = inject(TaskApplicationStore);
  private readonly router = inject(Router);

  protected readonly hasApplied = computed(
    () => this.taskHasApplied() || this.taskApplicationStore.hasApplied(this.taskId()),
  );

  protected readonly isVisible = computed(() => {
    if (this.status() !== TaskStatus.Open) {
      return false;
    }

    const user = this.authStore.user();

    return !user || user.role === UserRole.Freelancer;
  });

  protected onApply(): void {
    if (this.hasApplied()) {
      return;
    }

    if (!this.authStore.user()) {
      this.router.navigateByUrl('/login');
      return;
    }

    this.apply.emit();
  }
}
