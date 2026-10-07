import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output } from '@angular/core';
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

  readonly apply = output<void>();

  private readonly authStore = inject(AuthStore);
  private readonly taskApplicationStore = inject(TaskApplicationStore);
  private readonly router = inject(Router);

  protected readonly hasApplied = computed(() =>
    this.taskApplicationStore.hasApplied(this.taskId()),
  );

  protected readonly isVisible = computed(() => {
    if (this.status() !== TaskStatus.Open) {
      return false;
    }

    const user = this.authStore.user();

    return !user || user.role === UserRole.Freelancer;
  });

  constructor() {
    effect(() => {
      if (this.authStore.user()?.role !== UserRole.Freelancer || !this.isVisible()) {
        return;
      }

      // TODO: убрать отдельную загрузку откликов, когда бэкенд начнёт отдавать hasApplied вместе с данными задачи
      this.taskApplicationStore.load();
    });
  }

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
