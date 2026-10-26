import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { UiButtonComponent } from '@freelance-platform/ui';
import { ratingStars } from '../../../format';

@Component({
  selector: 'app-profile-card',
  imports: [UiButtonComponent],
  templateUrl: './profile-card.component.html',
  styleUrl: './profile-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileCardComponent {
  readonly displayName = input.required<string>();
  readonly email = input.required<string>();
  readonly roleLabel = input.required<string>();
  readonly registrationLabel = input.required<string>();
  readonly bio = input.required<string>();
  readonly birthdayLabel = input.required<string>();
  readonly rating = input.required<number>();
  readonly reviewsCount = input.required<number>();
  readonly isFreelancer = input.required<boolean>();
  readonly rateLabel = input.required<string | null>();
  readonly editing = input(false);

  readonly edit = output<void>();

  protected readonly verifiedLabel = 'Подтвержден';

  protected readonly skillsLabel = computed(() =>
    this.editing() ? 'Навыки пока недоступны' : 'Навыки пока не указаны',
  );

  protected readonly ratingLabel = computed(
    () => `${this.rating().toFixed(1)} (${this.reviewsCount()})`,
  );

  protected readonly stars = computed(() => ratingStars(this.rating()));

  protected readonly ratingAriaLabel = computed(
    () => `Рейтинг: ${this.rating().toFixed(1)} из 5`,
  );

  protected onEdit(): void {
    this.edit.emit();
  }
}
