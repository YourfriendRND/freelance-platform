import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
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

  protected readonly form = this.formBuilder.group({
    email: this.formBuilder.control('', [Validators.required, Validators.email]),
    password: this.formBuilder.control('', Validators.required),
  });

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.form.getRawValue() satisfies LoginFormValue;
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

    return null;
  }
}
