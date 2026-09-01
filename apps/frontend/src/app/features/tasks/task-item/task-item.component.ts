import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  formatTaskBudget,
  formatTaskDate,
  TASK_EXECUTION_TYPE_LABEL,
  TASK_STATUS_LABEL,
  TaskViewData,
  USER_ROLE_LABEL,
} from '@freelance-platform/shared-types';

@Component({
  selector: 'app-task-item',
  imports: [RouterLink],
  templateUrl: './task-item.component.html',
  styleUrl: './task-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskItemComponent {
  readonly task = input.required<TaskViewData>();

  protected readonly detailsHref = computed(() => `/tasks/${this.task().id}`);

  protected readonly statusLabel = computed(
    () => TASK_STATUS_LABEL[this.task().status],
  );

  protected readonly executionLabel = computed(
    () => TASK_EXECUTION_TYPE_LABEL[this.task().executionType],
  );

  protected readonly budgetLabel = computed(() => {
    const { budgetMin, budgetMax } = this.task();

    return formatTaskBudget(budgetMin, budgetMax);
  });

  protected readonly postedAtLabel = computed(() =>
    formatTaskDate(this.task().createdAt),
  );

  protected readonly author = computed(() => this.task().author);

  protected readonly authorName = computed(() => {
    const author = this.author();

    if (!author) {
      return '';
    }

    return [author.firstName, author.lastName].filter(Boolean).join(' ');
  });

  protected readonly authorRoleLabel = computed(() => {
    const author = this.author();

    return author ? USER_ROLE_LABEL[author.role] : '';
  });

  protected readonly authorInitial = computed(() => {
    const name = this.authorName();

    return name ? name.charAt(0).toUpperCase() : '?';
  });
}
