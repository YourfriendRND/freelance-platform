import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TASK_EXECUTION_TYPE_LABEL } from '@freelance-platform/shared-types';
import { ApplicationDetailsTask } from '../application-details.model';

@Component({
  selector: 'app-application-details-overview',
  imports: [RouterLink],
  templateUrl: './application-details-overview.component.html',
  styleUrl: './application-details-overview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApplicationDetailsOverviewComponent {
  readonly task = input.required<ApplicationDetailsTask>();

  protected readonly executionLabel = computed(() => {
    const executionType = this.task().executionType;

    if (!executionType) {
      return '—';
    }

    return TASK_EXECUTION_TYPE_LABEL[executionType];
  });
}
