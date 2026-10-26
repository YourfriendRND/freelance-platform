import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { UserApi } from '@freelance-platform/client-api';
import { resolveHttpErrorMessage } from '@freelance-platform/http';
import {
  FUTURE_BIRTHDAY_MESSAGE,
  INVALID_BIRTHDAY_MESSAGE,
  USER_RATE_MAX,
  UserResponse,
  UserRole,
} from '@freelance-platform/shared-types';
import { UiButtonComponent, UiTextFieldComponent } from '@freelance-platform/ui';
import { finalize } from 'rxjs';
import { ProfileCardComponent } from '../profile-card/profile-card.component';
import { toProfileCardView } from '../profile-page/profile-page.model';
import { toProfileUpdateRecord } from './profile-edit-form.model';
import {
  birthdayValidator,
  maxTrimmedLength,
  rateValidator,
  requiredTrimmed,
  trimmedLength,
} from './profile-edit-form.validation';

const PROFILE_SAVE_ERROR = 'Не удалось сохранить профиль';

@Component({
  selector: 'app-profile-edit-form',
  imports: [
    ReactiveFormsModule,
    UiButtonComponent,
    UiTextFieldComponent,
    ProfileCardComponent,
  ],
  templateUrl: './profile-edit-form.component.html',
  styleUrl: './profile-edit-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileEditFormComponent implements OnInit {
  readonly user = input.required<UserResponse>();
  readonly saved = output<UserResponse>();
  readonly cancelled = output<void>();

  private readonly userApi = inject(UserApi);
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly submitting = signal(false);
  protected readonly submitError = signal<string | null>(null);
  protected readonly view = computed(() => toProfileCardView(this.user()));

  protected readonly form = this.formBuilder.group({
    firstName: ['', [requiredTrimmed, trimmedLength(2, 255)]],
    lastName: ['', [trimmedLength(2, 255)]],
    bio: ['', [maxTrimmedLength(2000)]],
    birthday: ['', [birthdayValidator]],
    rate: ['', [rateValidator]],
  });

  ngOnInit(): void {
    const user = this.user();

    this.form.setValue({
      firstName: user.firstName,
      lastName: user.lastName ?? '',
      bio: user.bio ?? '',
      birthday: user.birthday ?? '',
      rate: user.rate === null || user.rate === undefined ? '' : String(user.rate),
    });
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.submitting()) {
      return;
    }

    const body = toProfileUpdateRecord(
      this.form.getRawValue(),
      this.user().role === UserRole.Freelancer,
    );

    this.submitting.set(true);
    this.submitError.set(null);

    this.userApi
      .update(this.user().id, body)
      .pipe(
        finalize(() => this.submitting.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (user) => {
          this.saved.emit(user);
        },
        error: (error: unknown) => {
          this.submitError.set(resolveHttpErrorMessage(error, PROFILE_SAVE_ERROR));
        },
      });
  }

  protected onCancel(): void {
    this.cancelled.emit();
  }

  protected fieldError(controlName: keyof ProfileEditFormComponent['form']['controls']): string | null {
    const control = this.form.controls[controlName];

    if (!control.touched || !control.errors) {
      return null;
    }

    if (control.errors['required']) {
      return 'Обязательное поле';
    }

    if (control.errors['minlength']) {
      const requiredLength = control.errors['minlength'].requiredLength;

      return `Минимум ${requiredLength} символа`;
    }

    if (control.errors['maxlength']) {
      const requiredLength = control.errors['maxlength'].requiredLength;

      return `Максимум ${requiredLength} символов`;
    }

    if (control.errors['birthdayInvalid']) {
      return INVALID_BIRTHDAY_MESSAGE;
    }

    if (control.errors['birthdayFuture']) {
      return FUTURE_BIRTHDAY_MESSAGE;
    }

    if (control.errors['rateInvalid']) {
      return 'Укажите целое число';
    }

    if (control.errors['rateMax']) {
      return `Максимум ${USER_RATE_MAX}`;
    }

    return null;
  }
}
