import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { map, startWith } from 'rxjs';
import { TaskApplicationStore } from '@freelance-platform/client-state';
import { CreateTaskApplicationRequest } from '@freelance-platform/shared-types';
import { formatTaskBudget } from '../../../format';
import { UiButtonComponent, UiModalComponent, UiTextFieldComponent } from '@freelance-platform/ui';

type TaskDetailsApplyFormValue = {
  proposedPrice: string;
  message: string;
};

type TaskDetailsApplyControlName = keyof TaskDetailsApplyFormValue;

const MESSAGE_MIN_LENGTH = 40;
const MESSAGE_MAX_LENGTH = 1000;
const MIN_PRICE = 1;
const INTEGER_PATTERN = /^\d+$/;

@Component({
  selector: 'app-task-details-apply-form',
  imports: [
    ReactiveFormsModule,
    UiModalComponent,
    UiTextFieldComponent,
    UiButtonComponent,
  ],
  templateUrl: './task-details-apply-form.component.html',
  styleUrl: './task-details-apply-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskDetailsApplyFormComponent {
  readonly taskId = input.required<string>();
  readonly taskTitle = input.required<string>();
  readonly budgetMin = input.required<number>();
  readonly budgetMax = input.required<number>();

  readonly closed = output<void>();

  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly taskApplicationStore = inject(TaskApplicationStore);

  protected readonly isSubmitting = this.taskApplicationStore.isSubmitting;
  protected readonly submitError = this.taskApplicationStore.submitError;
  protected readonly messageMaxLength = MESSAGE_MAX_LENGTH;

  protected readonly form = this.formBuilder.group({
    proposedPrice: this.formBuilder.control('', [
      Validators.required,
      Validators.pattern(INTEGER_PATTERN),
      Validators.min(MIN_PRICE),
    ]),
    message: this.formBuilder.control('', [
      Validators.required,
      Validators.minLength(MESSAGE_MIN_LENGTH),
      Validators.maxLength(MESSAGE_MAX_LENGTH),
    ]),
    // TODO: отправлять срок выполнения, когда бэкенд начнёт его принимать
    timeline: this.formBuilder.control({ value: '', disabled: true }),
  });

  protected readonly messageLength = toSignal(
    this.form.controls.message.valueChanges.pipe(
      startWith(this.form.controls.message.value),
      map((value) => value.length),
    ),
    { initialValue: 0 },
  );

  protected readonly budgetHint = computed(
    () => `Бюджет заказчика: ${formatTaskBudget(this.budgetMin(), this.budgetMax())}`,
  );

  protected readonly messageCounterLabel = computed(
    () => `${this.messageLength()}/${MESSAGE_MAX_LENGTH}`,
  );

  constructor() {
    this.taskApplicationStore.clearSubmitError();
  }

  protected onClosed(): void {
    this.closed.emit();
  }

  protected onSubmit(): void {
    if (this.isSubmitting()) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const body: CreateTaskApplicationRequest = {
      taskId: this.taskId(),
      message: value.message.trim(),
      proposedPrice: Number(value.proposedPrice),
    };

    this.taskApplicationStore.create(body).subscribe({
      next: () => {
        this.closed.emit();
      },
      error: () => undefined,
    });
  }

  protected fieldError(controlName: TaskDetailsApplyControlName): string | null {
    const control = this.form.controls[controlName];

    if (!control.touched || !control.errors) {
      return null;
    }

    switch (true) {
      case Boolean(control.errors['required']):
        return 'Обязательное поле';
      case Boolean(control.errors['minlength']):
        return `Минимум ${MESSAGE_MIN_LENGTH} символов`;
      case Boolean(control.errors['maxlength']):
        return `Максимум ${MESSAGE_MAX_LENGTH} символов`;
      case Boolean(control.errors['pattern']):
        return 'Введите целое число';
      case Boolean(control.errors['min']):
        return 'Значение должно быть больше 0';
      default:
        return null;
    }
  }
}
