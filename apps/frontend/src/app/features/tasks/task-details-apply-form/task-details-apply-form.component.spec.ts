import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { TaskApplicationStore } from '@freelance-platform/client-state';
import { createMockTaskApplicationResponse, MOCK_TASK_ID } from '@freelance-platform/shared-mock';
import { formatTaskBudget } from '../../../format';
import { setField } from '../../../testing/set-field';
import { TaskDetailsApplyFormComponent } from './task-details-apply-form.component';

describe('TaskDetailsApplyFormComponent testing', () => {
  let fixture: ComponentFixture<TaskDetailsApplyFormComponent>;
  let create: ReturnType<typeof vi.fn>;
  let submitError: ReturnType<typeof signal<string | null>>;

  const taskTitle = 'Разработка адаптивного лендинга';
  const budgetMin = 25000;
  const budgetMax = 40000;

  beforeEach(async () => {
    create = vi.fn().mockReturnValue(of(createMockTaskApplicationResponse()));
    submitError = signal<string | null>(null);

    await TestBed.configureTestingModule({
      imports: [TaskDetailsApplyFormComponent],
      providers: [
        {
          provide: TaskApplicationStore,
          useValue: {
            create,
            isSubmitting: signal(false),
            submitError,
            clearSubmitError: vi.fn(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskDetailsApplyFormComponent);
    fixture.componentRef.setInput('taskId', MOCK_TASK_ID);
    fixture.componentRef.setInput('taskTitle', taskTitle);
    fixture.componentRef.setInput('budgetMin', budgetMin);
    fixture.componentRef.setInput('budgetMax', budgetMax);
    fixture.detectChanges();
  });

  function root(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  it('should render the apply form in a modal', () => {
    expect(root().textContent).toContain('Новый отклик');
    expect(root().textContent).toContain('Откликнуться на эту задачу');
    expect(root().textContent).toContain(taskTitle);
    expect(root().textContent).toContain(
      `Бюджет заказчика: ${formatTaskBudget(budgetMin, budgetMax)}`,
    );
    expect(root().textContent).toContain('0/1000');
  });

  it('should limit the cover letter to 1000 characters', () => {
    const message = root().querySelector('#task-apply-message') as HTMLTextAreaElement;

    expect(message.maxLength).toBe(1000);
  });

  it('should emit closed when cancel is clicked', () => {
    const closed = vi.fn();
    fixture.componentInstance.closed.subscribe(closed);

    const cancelButton = Array.from(root().querySelectorAll('button')).find(
      (button) => button.textContent?.includes('Отмена'),
    ) as HTMLButtonElement;

    cancelButton.click();

    expect(closed).toHaveBeenCalledTimes(1);
  });

  it('should emit closed when the modal close button is clicked', () => {
    const closed = vi.fn();
    fixture.componentInstance.closed.subscribe(closed);

    (root().querySelector('.ui-modal__close') as HTMLButtonElement).click();

    expect(closed).toHaveBeenCalledTimes(1);
  });

  it('should show validation messages and keep the modal open when the form is empty', () => {
    const closed = vi.fn();
    fixture.componentInstance.closed.subscribe(closed);

    (root().querySelector('button[type="submit"]') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(closed).not.toHaveBeenCalled();
    expect(create).not.toHaveBeenCalled();
    expect(root().textContent).toContain('Обязательное поле');
  });

  it('should create an application and close the modal', () => {
    const closed = vi.fn();
    fixture.componentInstance.closed.subscribe(closed);

    setField(fixture, '#task-apply-price', '2500');
    setField(fixture, '#task-apply-message', 'а'.repeat(40));
    fixture.detectChanges();

    (root().querySelector('button[type="submit"]') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(create).toHaveBeenCalledWith({
      taskId: MOCK_TASK_ID,
      message: 'а'.repeat(40),
      proposedPrice: 2500,
    });
    expect(closed).toHaveBeenCalledTimes(1);
  });

  it('should send a timeline of 2 to 100 characters', () => {
    setField(fixture, '#task-apply-price', '2500');
    setField(fixture, '#task-apply-message', 'а'.repeat(40));
    setField(fixture, '#task-apply-timeline', '2 недели');
    fixture.detectChanges();

    (root().querySelector('button[type="submit"]') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(create).toHaveBeenCalledWith({
      taskId: MOCK_TASK_ID,
      message: 'а'.repeat(40),
      proposedPrice: 2500,
      timeline: '2 недели',
    });
  });

  it('should reject a timeline shorter than 2 characters', () => {
    setField(fixture, '#task-apply-price', '2500');
    setField(fixture, '#task-apply-message', 'а'.repeat(40));
    setField(fixture, '#task-apply-timeline', 'я');
    fixture.detectChanges();

    (root().querySelector('button[type="submit"]') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(create).not.toHaveBeenCalled();
    expect(root().textContent).toContain('Минимум 2 символа');
  });

  it('should reject a timeline longer than 100 characters', () => {
    setField(fixture, '#task-apply-price', '2500');
    setField(fixture, '#task-apply-message', 'а'.repeat(40));
    setField(fixture, '#task-apply-timeline', 'я'.repeat(101));
    fixture.detectChanges();

    (root().querySelector('button[type="submit"]') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(create).not.toHaveBeenCalled();
    expect(root().textContent).toContain('Максимум 100 символов');
  });

  it('should keep the modal open and show the submit error', () => {
    const closed = vi.fn();
    fixture.componentInstance.closed.subscribe(closed);
    create.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 409,
            error: { message: 'Вы уже откликались на эту задачу' },
          }),
      ),
    );
    submitError.set('Вы уже откликались на эту задачу');

    setField(fixture, '#task-apply-price', '2500');
    setField(fixture, '#task-apply-message', 'а'.repeat(40));
    fixture.detectChanges();

    (root().querySelector('button[type="submit"]') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(closed).not.toHaveBeenCalled();
    expect(root().textContent).toContain('Вы уже откликались на эту задачу');
  });
});
