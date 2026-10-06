import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { UiButtonComponent } from '@freelance-platform/ui';
import { ApplicationDetailsClient } from '../application-details.model';

@Component({
  selector: 'app-application-details-client',
  imports: [UiButtonComponent],
  templateUrl: './application-details-client.component.html',
  styleUrl: './application-details-client.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApplicationDetailsClientComponent {
  readonly client = input.required<ApplicationDetailsClient>();

  protected readonly initial = computed(() => {
    const [firstLetter] = this.client().name.trim();

    return firstLetter ? firstLetter.toUpperCase() : '?';
  });
}
