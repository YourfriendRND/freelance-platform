import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TaskViewData } from '@freelance-platform/shared-types';
import { formatTaskBudget, formatTaskDate } from '../../../format';

@Component({
  selector: 'app-task-details-aside',
  templateUrl: './task-details-aside.component.html',
  styleUrl: './task-details-aside.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskDetailsAsideComponent {
  readonly task = input.required<TaskViewData>();

  protected readonly budgetLabel = computed(() => {
    const { budgetMin, budgetMax } = this.task();

    return formatTaskBudget(budgetMin, budgetMax);
  });

  protected readonly deadlineLabel = computed(() =>
    formatTaskDate(this.task().deadline),
  );
}
