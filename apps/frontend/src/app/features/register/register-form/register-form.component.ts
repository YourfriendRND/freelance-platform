import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { UserRole } from '@freelance-platform/shared-types';
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

  protected readonly roleOptions = REGISTER_ROLE_OPTIONS;

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

    const value = this.form.getRawValue() satisfies RegisterFormValue;
    void value;
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
