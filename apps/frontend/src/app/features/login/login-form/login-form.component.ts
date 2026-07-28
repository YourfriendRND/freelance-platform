import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthApi } from '@freelance-platform/client-api';
import { LoginUserRequest } from '@freelance-platform/shared-types';
import { UiButtonComponent, UiTextFieldComponent } from '@freelance-platform/ui';

type LoginFormValue = {
  email: string;
  password: string;
};

@Component({
  selector: 'app-login-form',
  imports: [ReactiveFormsModule, UiTextFieldComponent, UiButtonComponent],
  templateUrl: './login-form.component.html',
  styleUrl: './login-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginFormComponent {
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly authApi = inject(AuthApi);
  private readonly router = inject(Router);

  protected readonly submitting = signal(false);
  protected readonly submitError = signal<string | null>(null);

  protected readonly form = this.formBuilder.group({
    email: this.formBuilder.control('', [Validators.required, Validators.email]),
    password: this.formBuilder.control('', [
      Validators.required,
      Validators.minLength(8),
    ]),
  });

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.submitting()) {
      return;
    }

    const value = this.form.getRawValue() satisfies LoginFormValue;

    const body: LoginUserRequest = {
      email: value.email,
      password: value.password,
    };

    this.submitting.set(true);
    this.submitError.set(null);

    this.authApi
      .login(body)
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: () => {
          void this.router.navigate(['/welcome']);
        },
        error: (error: unknown) => {
          this.submitError.set(this.resolveSubmitError(error));
        },
      });
  }

  protected fieldError(
    controlName: keyof LoginFormComponent['form']['controls'],
  ): string | null {
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

    return null;
  }

  private resolveSubmitError(error: unknown): string {
    if (!(error instanceof HttpErrorResponse)) {
      return 'Не удалось войти';
    }

    const { message } = error.error ?? {};

    if (typeof message === 'string' && message.trim()) {
      return message.trim();
    }

    if (Array.isArray(message)) {
      const [firstMessage] = message;

      if (typeof firstMessage === 'string' && firstMessage.trim()) {
        return firstMessage.trim();
      }
    }

    return 'Не удалось войти';
  }
}
