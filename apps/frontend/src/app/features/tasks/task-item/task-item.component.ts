import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import {
  TASK_EXECUTION_TYPE_LABEL,
  TASK_STATUS_LABEL,
  USER_ROLE_LABEL,
} from '@freelance-platform/shared-types';
import { TaskItemData } from './task-item.model';

const BUDGET_FORMATTER = new Intl.NumberFormat('ru-RU');
const DATE_FORMATTER = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

@Component({
  selector: 'app-task-item',
  templateUrl: './task-item.component.html',
  styleUrl: './task-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskItemComponent {
  readonly task = input.required<TaskItemData>();

  protected readonly statusLabel = computed(
    () => TASK_STATUS_LABEL[this.task().status],
  );

  protected readonly executionLabel = computed(
    () => TASK_EXECUTION_TYPE_LABEL[this.task().executionType],
  );

  protected readonly budgetLabel = computed(() => {
    const { budgetMin, budgetMax } = this.task();

    return `${BUDGET_FORMATTER.format(budgetMin)} – ${BUDGET_FORMATTER.format(budgetMax)} ₽`;
  });

  protected readonly postedAtLabel = computed(() =>
    DATE_FORMATTER.format(new Date(this.task().createdAt)),
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
