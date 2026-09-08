import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { UiButtonComponent } from '@freelance-platform/ui';

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

  // TODO: Добавить avatarUrl, bio, skills, hourlyRate и признак верификации в данные пользователя
}
