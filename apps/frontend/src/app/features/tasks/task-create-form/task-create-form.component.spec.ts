import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { TaskCategoryApi } from '@freelance-platform/client-api';
import { TaskStore } from '@freelance-platform/client-state';
import {
  createMockTaskCategoryResponse,
  createMockTaskResponse,
} from '@freelance-platform/shared-mock';
import {
  CreateTaskRequest,
  TaskExecutionType,
  TaskResponse,
  TaskStatus,
} from '@freelance-platform/shared-types';
import { TaskCreateFormComponent } from './task-create-form.component';

describe('TaskCreateFormComponent testing', () => {
  let fixture: ComponentFixture<TaskCreateFormComponent>;
  let create: ReturnType<typeof vi.fn>;

  const category = createMockTaskCategoryResponse();

  const task: TaskResponse = createMockTaskResponse({
    budgetMin: 10000,
    budgetMax: 20000,
    categoryId: category.id,
  });

  beforeEach(async () => {
    create = vi.fn().mockReturnValue(of(task));

    await TestBed.configureTestingModule({
      imports: [TaskCreateFormComponent],
      providers: [
        provideRouter([]),
        { provide: TaskCategoryApi, useValue: { findAll: () => of([category]) } },
        { provide: TaskStore, useValue: { create } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskCreateFormComponent);
    fixture.detectChanges();
  });

  function root(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  function setInput(selector: string, value: string): void {
    const input = root().querySelector(selector) as HTMLInputElement;
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }

  function setSelect(selector: string, value: string): void {
    const select = root().querySelector(selector) as HTMLSelectElement;
    select.value = value;
    select.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function fillValidForm(): CreateTaskRequest {
    const body: CreateTaskRequest = {
      title: 'Разработка адаптивного лендинга',
      description: 'Подробное описание проекта '.repeat(5),
      categoryId: category.id,
      budgetMin: 10000,
      budgetMax: 20000,
      deadline: '2026-09-15',
      executionType: TaskExecutionType.Remote,
      status: TaskStatus.Draft,
    };

    setInput('#task-create-title', body.title);
    setInput('#task-create-description', body.description);
    setSelect('#task-create-category', body.categoryId);
    setInput('#task-create-budget-min', String(body.budgetMin));
    setInput('#task-create-budget-max', String(body.budgetMax));
    setInput('#task-create-deadline', body.deadline);
    setSelect('#task-create-execution-type', body.executionType);
    setSelect('#task-create-status', body.status);
    fixture.detectChanges();

    return body;
  }

  function submit(): void {
    const button = Array.from(root().querySelectorAll('button')).find(
      (item) => item.textContent?.trim() === 'Создать задачу',
    );

    button?.click();
    fixture.detectChanges();
  }

  it('should render form controls and loaded categories', () => {
    expect(root().textContent).toContain('Название задачи');
    expect(root().textContent).toContain('Категория');
    expect(root().textContent).toContain(category.title);
    expect(root().textContent).toContain('Срок исполнения до');
  });

  it('should emit cancel when the cancel button is clicked', () => {
    const cancel = vi.spyOn(fixture.componentInstance.cancel, 'emit');

    const cancelButton = Array.from(root().querySelectorAll('button')).find(
      (button) => button.textContent?.trim() === 'Отмена',
    );

    cancelButton?.click();

    expect(cancel).toHaveBeenCalledTimes(1);
  });

  it('should show validation messages and skip submit when form is invalid', () => {
    submit();

    expect(create).not.toHaveBeenCalled();
    expect(root().textContent).toContain('Проверьте поля формы');
    expect(root().textContent).toContain('Выберите категорию');
  });

  it('should validate the budget range', () => {
    fillValidForm();
    setInput('#task-create-budget-min', '20000');
    setInput('#task-create-budget-max', '10000');

    submit();

    expect(create).not.toHaveBeenCalled();
    expect(root().textContent).toContain(
      'Минимальный бюджет должен быть меньше максимального',
    );
  });

  it('should create a task and navigate to tasks', () => {
    const body = fillValidForm();
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    submit();

    expect(create).toHaveBeenCalledWith(body);
    expect(navigate).toHaveBeenCalledWith(['/tasks']);
  });

  it('should disable submit while creation is in progress', () => {
    const request = new Subject<TaskResponse>();
    const router = TestBed.inject(Router);
    create.mockReturnValue(request.asObservable());
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fillValidForm();
    submit();

    const submitButton = Array.from(root().querySelectorAll('button')).find(
      (item) => item.textContent?.trim() === 'Создание...',
    ) as HTMLButtonElement;

    expect(submitButton.disabled).toBe(true);

    request.next(task);
    request.complete();
  });

  it('should show a server validation error on a matching field', () => {
    create.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 404,
            error: { message: 'Категория с "missing" не найдена' },
          }),
      ),
    );

    fillValidForm();
    submit();

    expect(root().textContent).toContain('Категория с "missing" не найдена');
  });
});
