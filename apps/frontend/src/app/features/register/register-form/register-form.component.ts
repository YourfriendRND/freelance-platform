import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthApi } from '@freelance-platform/client-api';
import { resolveHttpErrorMessage } from '@freelance-platform/http';
import {
  CreateUserRequest,
  UserRole,
} from '@freelance-platform/shared-types';
import {
  UiButtonComponent,
  UiCheckboxComponent,
  UiSelectComponent,
  UiTextFieldComponent,
} from '@freelance-platform/ui';
import {
  REGISTER_ROLE_OPTIONS,
  RegisterFormValue,
} from './register-form.model';
import { passwordMatchValidator } from './register-form.validation';

@Component({
  selector: 'app-register-form',
  imports: [
    ReactiveFormsModule,
    UiSelectComponent,
    UiTextFieldComponent,
    UiCheckboxComponent,
    UiButtonComponent,
  ],
  templateUrl: './register-form.component.html',
  styleUrl: './register-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterFormComponent {
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly authApi = inject(AuthApi);
  private readonly router = inject(Router);

  protected readonly roleOptions = REGISTER_ROLE_OPTIONS;
  protected readonly submitting = signal(false);
  protected readonly submitError = signal<string | null>(null);

  protected readonly form = this.formBuilder.group(
    {
      role: this.formBuilder.control<UserRole | null>(null, Validators.required),
      firstName: this.formBuilder.control('', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(255),
      ]),
      lastName: this.formBuilder.control('', [
        Validators.minLength(2),
        Validators.maxLength(255),
      ]),
      email: this.formBuilder.control('', [Validators.required, Validators.email]),
      password: this.formBuilder.control('', [
        Validators.required,
        Validators.minLength(8),
      ]),
      confirmPassword: this.formBuilder.control('', Validators.required),
      acceptTerms: this.formBuilder.control(false, Validators.requiredTrue),
    },
    {
      validators: passwordMatchValidator('password', 'confirmPassword'),
    },
  );

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.submitting()) {
      return;
    }

    const value = this.form.getRawValue() satisfies RegisterFormValue;

    if (value.role === null) {
      return;
    }

    const lastName = value.lastName.trim();

    const body: CreateUserRequest = {
      role: value.role,
      firstName: value.firstName,
      email: value.email,
      password: value.password,
      ...(lastName ? { lastName } : {}),
    };

    this.submitting.set(true);
    this.submitError.set(null);

    this.authApi
      .join(body)
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: () => {
          this.router.navigate(['/login']);
        },
        error: (error: unknown) => {
          this.submitError.set(
            resolveHttpErrorMessage(error, 'Не удалось зарегистрироваться'),
          );
        },
      });
  }

  protected roleError(): string | null {
    const control = this.form.controls.role;

    if (!control.touched || !control.errors?.['required']) {
      return null;
    }

    return 'Выберите тип аккаунта';
  }

  protected fieldError(controlName: keyof RegisterFormComponent['form']['controls']): string | null {
    const control = this.form.controls[controlName];

    if (!control.touched || !control.errors) {
      return null;
    }

    if (control.errors['required']) {
      return 'Обязательное поле';
    }

    if (control.errors['email']) {
      return 'Введите корректный email';
    }

    if (control.errors['minlength']) {
      const requiredLength = control.errors['minlength'].requiredLength;

      return `Минимум ${requiredLength} символа`;
    }

    if (control.errors['maxlength']) {
      const requiredLength = control.errors['maxlength'].requiredLength;

      return `Максимум ${requiredLength} символов`;
    }

    if (control.errors['requiredTrue']) {
      return 'Необходимо принять условия';
    }

    return null;
  }

  protected confirmPasswordError(): string | null {
    const control = this.form.controls.confirmPassword;

    if (!control.touched) {
      return null;
    }

    if (control.errors?.['required']) {
      return 'Подтвердите пароль';
    }

    if (this.form.errors?.['passwordMismatch']) {
      return 'Пароли не совпадают';
    }

    return null;
  }
}
