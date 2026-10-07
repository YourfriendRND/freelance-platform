import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import {
  TASK_APPLICATION_STATUS_LABEL,
  TaskApplicationStatus,
} from '@freelance-platform/shared-types';
import { formatTaskDate } from '../../../format';
import { ApplicationDetailsView } from '../application-details.model';

const priceFormatter = new Intl.NumberFormat('ru-RU');

@Component({
  selector: 'app-application-details-card',
  templateUrl: './application-details-card.component.html',
  styleUrl: './application-details-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApplicationDetailsCardComponent {
  readonly application = input.required<ApplicationDetailsView>();

  protected readonly TaskApplicationStatus = TaskApplicationStatus;

  protected readonly statusLabel = computed(
    () => TASK_APPLICATION_STATUS_LABEL[this.application().status],
  );

  protected readonly submittedAtLabel = computed(
    () => `${formatTaskDate(this.application().submittedAt)} г.`,
  );

  protected readonly priceLabel = computed(() => {
    const proposedPrice = this.application().proposedPrice;

    if (proposedPrice === null) {
      return '—';
    }

    return `${priceFormatter.format(proposedPrice)} ₽`;
  });
}
