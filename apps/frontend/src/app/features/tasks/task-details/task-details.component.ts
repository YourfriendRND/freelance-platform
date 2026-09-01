import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import {
  formatTaskDate,
  TASK_EXECUTION_TYPE_LABEL,
  TASK_STATUS_LABEL,
  TaskViewData,
} from '@freelance-platform/shared-types';
import { TaskDetailsClientComponent } from '../task-details-client/task-details-client.component';

@Component({
  selector: 'app-task-details',
  imports: [TaskDetailsClientComponent],
  templateUrl: './task-details.component.html',
  styleUrl: './task-details.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskDetailsComponent {
  readonly task = input.required<TaskViewData>();

  protected readonly statusLabel = computed(
    () => TASK_STATUS_LABEL[this.task().status],
  );

  protected readonly executionLabel = computed(
    () => TASK_EXECUTION_TYPE_LABEL[this.task().executionType],
  );

  protected readonly postedAtLabel = computed(() =>
    formatTaskDate(this.task().createdAt),
  );

  protected readonly author = computed(() => this.task().author);
}
