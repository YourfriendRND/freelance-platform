import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TASK_APPLICATION_STATUS_LABEL } from '@freelance-platform/shared-types';
import { formatTaskDate } from '../../../format';
import { ApplicationListItem } from '../applications-list.model';

const priceFormatter = new Intl.NumberFormat('ru-RU');

@Component({
  selector: 'app-application-item',
  imports: [RouterLink],
  templateUrl: './application-item.component.html',
  styleUrl: './application-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApplicationItemComponent {
  readonly application = input.required<ApplicationListItem>();

  protected readonly statusLabel = computed(
    () => TASK_APPLICATION_STATUS_LABEL[this.application().status],
  );

  protected readonly priceLabel = computed(() => {
    const proposedPrice = this.application().proposedPrice;

    if (proposedPrice === null) {
      return '—';
    }

    return `${priceFormatter.format(proposedPrice)} ₽`;
  });

  protected readonly submittedAtLabel = computed(() =>
    formatTaskDate(this.application().submittedAt),
  );

  protected readonly clientInitial = computed(() => {
    const [firstLetter] = this.application().clientName.trim();

    return firstLetter ? firstLetter.toUpperCase() : '?';
  });
}
