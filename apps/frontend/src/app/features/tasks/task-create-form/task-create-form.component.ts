import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  output,
  signal,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { TaskCategoryApi } from '@freelance-platform/client-api';
import { TaskStore } from '@freelance-platform/client-state';
import { resolveHttpErrorMessage } from '@freelance-platform/http';
import {
  CreateTaskRequest,
  TASK_EXECUTION_TYPE_LABEL,
  TASK_STATUS_LABEL,
  TaskCategoryResponse,
  TaskExecutionType,
  TaskStatus,
} from '@freelance-platform/shared-types';
import {
  UiButtonComponent,
  UiSelectComponent,
  UiSelectOption,
  UiTextFieldComponent,
} from '@freelance-platform/ui';

type TaskCreateFormValue = {
  title: string;
  description: string;
  categoryId: string | null;
  budgetMin: string;
  budgetMax: string;
  deadline: string;
  executionType: TaskExecutionType;
  status: TaskStatus;
};

type TaskCreateControlName = keyof TaskCreateFormValue;

const TITLE_MIN_LENGTH = 2;
const TITLE_MAX_LENGTH = 255;
const DESCRIPTION_MIN_LENGTH = 100;
const MIN_BUDGET = 1;
const INTEGER_PATTERN = /^\d+$/;
const DATE_INPUT_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function budgetRangeValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const budgetMin = control.get('budgetMin')?.value;
    const budgetMax = control.get('budgetMax')?.value;

    if (
      !INTEGER_PATTERN.test(String(budgetMin)) ||
      !INTEGER_PATTERN.test(String(budgetMax))
    ) {
      return null;
    }

    return Number(budgetMin) < Number(budgetMax) ? null : { budgetRange: true };
  };
}

function dateInputValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value) {
      return null;
    }

    if (typeof value !== 'string' || !DATE_INPUT_PATTERN.test(value)) {
      return { date: true };
    }

    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));

    const isSameDate =
      date.getUTCFullYear() === year &&
      date.getUTCMonth() === month - 1 &&
      date.getUTCDate() === day;

    return isSameDate ? null : { date: true };
  };
}

@Component({
  selector: 'app-task-create-form',
  imports: [
    ReactiveFormsModule,
    UiTextFieldComponent,
    UiSelectComponent,
    UiButtonComponent,
  ],
  templateUrl: './task-create-form.component.html',
  styleUrl: './task-create-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskCreateFormComponent {
  readonly cancel = output<void>();

  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly taskCategoryApi = inject(TaskCategoryApi);
  private readonly taskStore = inject(TaskStore);
  private readonly router = inject(Router);

  protected readonly categories = signal<readonly TaskCategoryResponse[]>([]);
  protected readonly categoryLoadError = signal<string | null>(null);
  protected readonly submitting = signal(false);
  protected readonly submitError = signal<string | null>(null);

  protected readonly categoryOptions = computed<readonly UiSelectOption[]>(() =>
    this.categories().map(({ id, title }) => ({ value: id, label: title })),
  );

  protected readonly executionTypeOptions: readonly UiSelectOption<TaskExecutionType>[] = [
    {
      value: TaskExecutionType.Remote,
      label: TASK_EXECUTION_TYPE_LABEL[TaskExecutionType.Remote],
    },
    {
      value: TaskExecutionType.CustomerPlace,
      label: TASK_EXECUTION_TYPE_LABEL[TaskExecutionType.CustomerPlace],
    },
  ];

  protected readonly statusOptions: readonly UiSelectOption<TaskStatus>[] = [
    {
      value: TaskStatus.Draft,
      label: TASK_STATUS_LABEL[TaskStatus.Draft],
    },
    {
      value: TaskStatus.Open,
      label: TASK_STATUS_LABEL[TaskStatus.Open],
    },
  ];

  protected readonly form = this.formBuilder.group(
    {
      title: this.formBuilder.control('', [
        Validators.required,
        Validators.minLength(TITLE_MIN_LENGTH),
        Validators.maxLength(TITLE_MAX_LENGTH),
      ]),
      description: this.formBuilder.control('', [
        Validators.required,
        Validators.minLength(DESCRIPTION_MIN_LENGTH),
      ]),
      categoryId: this.formBuilder.control<string | null>(null, Validators.required),
      budgetMin: this.formBuilder.control('', [
        Validators.required,
        Validators.pattern(INTEGER_PATTERN),
        Validators.min(MIN_BUDGET),
      ]),
      budgetMax: this.formBuilder.control('', [
        Validators.required,
        Validators.pattern(INTEGER_PATTERN),
        Validators.min(MIN_BUDGET),
      ]),
      deadline: this.formBuilder.control('', [
        Validators.required,
        dateInputValidator(),
      ]),
      executionType: this.formBuilder.control(
        TaskExecutionType.Remote,
        Validators.required,
      ),
      status: this.formBuilder.control(TaskStatus.Draft, Validators.required),
    },
    {
      validators: budgetRangeValidator(),
    },
  );

  constructor() {
    this.taskCategoryApi.findAll().subscribe({
      next: (categories) => {
        this.categories.set(categories);
        this.categoryLoadError.set(null);
      },
      error: () => {
        this.categoryLoadError.set('Не удалось загрузить категории');
      },
    });
  }

  protected onSubmit(): void {
    if (this.submitting()) {
      return;
    }

    this.clearServerErrors();
    this.submitError.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.submitError.set('Проверьте поля формы');
      return;
    }

    const value = this.form.getRawValue() satisfies TaskCreateFormValue;

    if (!value.categoryId) {
      return;
    }

    const body: CreateTaskRequest = {
      title: value.title,
      description: value.description,
      categoryId: value.categoryId,
      budgetMin: Number(value.budgetMin),
      budgetMax: Number(value.budgetMax),
      deadline: value.deadline,
      executionType: value.executionType,
      status: value.status,
    };

    this.submitting.set(true);

    this.taskStore.create(body).subscribe({
      next: () => {
        this.submitting.set(false);
        this.router.navigate(['/tasks']);
      },
      error: (error: unknown) => {
        this.submitting.set(false);
        this.applyServerError(error);
      },
    });
  }

  protected onCancel(): void {
    this.cancel.emit();
  }

  protected fieldError(
    controlName: keyof TaskCreateFormComponent['form']['controls'],
  ): string | null {
    const control = this.form.controls[controlName];

    if (!control.touched || !control.errors) {
      return null;
    }

    if (control.errors['required']) {
      return 'Обязательное поле';
    }

    if (control.errors['server']) {
      return control.errors['server'];
    }

    if (control.errors['minlength']) {
      const requiredLength = control.errors['minlength'].requiredLength;

      return `Минимум ${requiredLength} символов`;
    }

    if (control.errors['maxlength']) {
      const requiredLength = control.errors['maxlength'].requiredLength;

      return `Максимум ${requiredLength} символов`;
    }

    if (control.errors['pattern']) {
      return 'Введите целое число';
    }

    if (control.errors['min']) {
      return 'Значение должно быть больше 0';
    }

    if (control.errors['date']) {
      return 'Введите корректную дату';
    }

    return null;
  }

  protected categoryError(): string | null {
    const control = this.form.controls.categoryId;

    if (!control.touched || !control.errors?.['required']) {
      return null;
    }

    return 'Выберите категорию';
  }

  protected budgetError(): string | null {
    const budgetMin = this.form.controls.budgetMin;
    const budgetMax = this.form.controls.budgetMax;

    if ((!budgetMin.touched && !budgetMax.touched) || !this.form.errors) {
      return null;
    }

    if (this.form.errors['budgetRange']) {
      return 'Минимальный бюджет должен быть меньше максимального';
    }

    return null;
  }

  private applyServerError(error: unknown): void {
    const messages = this.extractServerMessages(error);
    const hasFieldError = messages.some((message) => {
      const controlName = this.resolveServerField(message);

      if (!controlName) {
        return false;
      }

      this.setControlServerError(controlName, message);
      return true;
    });

    if (!hasFieldError) {
      this.submitError.set(
        resolveHttpErrorMessage(error, 'Не удалось создать задачу'),
      );
    }
  }

  private clearServerErrors(): void {
    Object.values(this.form.controls).forEach((control) => {
      if (!control.errors?.['server']) {
        return;
      }

      const errors = { ...control.errors };
      delete errors['server'];

      control.setErrors(Object.keys(errors).length > 0 ? errors : null);
    });
  }

  private extractServerMessages(error: unknown): readonly string[] {
    if (!(error instanceof HttpErrorResponse)) {
      return [];
    }

    const { message } = error.error ?? {};

    if (typeof message === 'string' && message.trim()) {
      return [message.trim()];
    }

    if (Array.isArray(message)) {
      return message.filter(
        (item): item is string => typeof item === 'string' && item.trim() !== '',
      );
    }

    return [];
  }

  private resolveServerField(message: string): TaskCreateControlName | null {
    const normalizedMessage = message.toLowerCase();

    if (normalizedMessage.includes('title') || normalizedMessage.includes('назван')) {
      return 'title';
    }

    if (
      normalizedMessage.includes('description') ||
      normalizedMessage.includes('описан')
    ) {
      return 'description';
    }

    if (
      normalizedMessage.includes('category') ||
      normalizedMessage.includes('uuid') ||
      normalizedMessage.includes('категор')
    ) {
      return 'categoryId';
    }

    if (
      normalizedMessage.includes('budgetmin') ||
      normalizedMessage.includes('budget min') ||
      normalizedMessage.includes('минимальн')
    ) {
      return 'budgetMin';
    }

    if (
      normalizedMessage.includes('budgetmax') ||
      normalizedMessage.includes('budget max') ||
      normalizedMessage.includes('максимальн')
    ) {
      return 'budgetMax';
    }

    if (
      normalizedMessage.includes('deadline') ||
      normalizedMessage.includes('date') ||
      normalizedMessage.includes('срок')
    ) {
      return 'deadline';
    }

    if (
      normalizedMessage.includes('executiontype') ||
      normalizedMessage.includes('execution type') ||
      normalizedMessage.includes('способ') ||
      normalizedMessage.includes('локац')
    ) {
      return 'executionType';
    }

    if (normalizedMessage.includes('status') || normalizedMessage.includes('статус')) {
      return 'status';
    }

    return null;
  }

  private setControlServerError(
    controlName: TaskCreateControlName,
    message: string,
  ): void {
    const control = this.form.controls[controlName];

    control.setErrors({
      ...(control.errors ?? {}),
      server: message,
    });
    control.markAsTouched();
  }
}
