import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  formatTaskDate,
  TaskExecutionType,
  TaskStatus,
  TaskViewData,
  UserResponse,
  UserRole,
} from '@freelance-platform/shared-types';
import { TaskDetailsComponent } from './task-details.component';

describe('TaskDetailsComponent testing', () => {
  let fixture: ComponentFixture<TaskDetailsComponent>;

  const task: TaskViewData = {
    id: '5c8e1a97-0a01-4b62-8d11-7e9f0a1b2c01',
    title: 'Разработка адаптивного лендинга',
    description: 'Нужен адаптивный лендинг для запуска продукта',
    status: TaskStatus.Open,
    budgetMin: 25000,
    budgetMax: 40000,
    executionType: TaskExecutionType.Remote,
    deadline: '2026-09-15',
    createdAt: '2026-05-29T12:00:00.000Z',
    categoryTitle: 'Программирование и IT',
    applicationsCount: 0,
    viewsCount: 0,
    author: null,
  };

  const author: UserResponse = {
    id: '8caf25cf-d7b9-4950-a0c5-baea8505ff1d',
    email: 'ivan.petrov@example.com',
    firstName: 'Иван',
    lastName: 'Петров',
    role: UserRole.Client,
    createdAt: '2026-08-01T00:00:00.000Z',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskDetailsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskDetailsComponent);
  });

  function render(data: TaskViewData): HTMLElement {
    fixture.componentRef.setInput('task', data);
    fixture.detectChanges();

    return fixture.nativeElement as HTMLElement;
  }

  it('should render task details', () => {
    const root = render(task);

    expect(root.querySelector('.task-details__title')?.textContent).toContain(
      task.title,
    );
    expect(root.querySelector('.task-details__status')?.textContent).toContain(
      'Открыта',
    );
    expect(root.querySelector('.task-details__status')?.getAttribute('data-status')).toBe(
      TaskStatus.Open,
    );
    expect(root.querySelector('.task-details__section-title')?.textContent).toContain(
      'Описание',
    );
    expect(root.querySelector('.task-details__description-text')?.textContent).toContain(
      task.description,
    );
    expect(root.querySelector('.task-details__tag')?.textContent).toContain(
      task.categoryTitle,
    );
    expect(root.textContent).toContain(
      `Опубликовано ${formatTaskDate(task.createdAt)}`,
    );
    expect(root.textContent).toContain('Удалённо');
    expect(root.querySelector('app-task-details-client')).toBeNull();
  });

  it('should render the client block when author is present', () => {
    const root = render({ ...task, author });

    expect(root.querySelector('app-task-details-client')).not.toBeNull();
    expect(root.textContent).toContain('О заказчике');
    expect(root.textContent).toContain('Иван Петров');
  });
});
