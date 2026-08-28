import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  TaskExecutionType,
  TaskStatus,
  UserResponse,
  UserRole,
} from '@freelance-platform/shared-types';
import { TaskItemComponent } from './task-item.component';
import { TaskItemData } from './task-item.model';

describe('TaskItemComponent testing', () => {
  let fixture: ComponentFixture<TaskItemComponent>;

  const task: TaskItemData = {
    id: 'task-1',
    title: 'Разработка адаптивного лендинга',
    description: 'Нужен адаптивный лендинг для запуска продукта',
    status: TaskStatus.Open,
    budgetMin: 25000,
    budgetMax: 40000,
    executionType: TaskExecutionType.Remote,
    createdAt: '2026-05-29T12:00:00.000Z',
    categoryTitle: 'Программирование и IT',
    applicationsCount: 0,
    viewsCount: 0,
    author: null,
  };

  const author: UserResponse = {
    id: 'user-1',
    email: 'ivan.petrov@example.com',
    firstName: 'Иван',
    lastName: 'Петров',
    role: UserRole.Client,
    createdAt: '2026-08-01T00:00:00.000Z',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskItemComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskItemComponent);
  });

  function render(data: TaskItemData): HTMLElement {
    fixture.componentRef.setInput('task', data);
    fixture.detectChanges();

    return fixture.nativeElement as HTMLElement;
  }

  it('should render task fields from the card model', () => {
    const root = render(task);
    const budgetFormatter = new Intl.NumberFormat('ru-RU');
    const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    expect(root.querySelector('.task-item__title')?.textContent).toContain(
      task.title,
    );
    expect(root.querySelector('.task-item__description')?.textContent).toContain(
      task.description,
    );
    expect(root.querySelector('.task-item__status')?.textContent).toContain(
      'Открыта',
    );
    expect(root.querySelector('.task-item__status')?.getAttribute('data-status')).toBe(
      TaskStatus.Open,
    );
    expect(root.querySelector('.task-item__budget')?.textContent).toContain(
      `${budgetFormatter.format(task.budgetMin)} – ${budgetFormatter.format(task.budgetMax)} ₽`,
    );
    expect(root.querySelector('.task-item__tag')?.textContent).toContain(
      task.categoryTitle,
    );
    expect(root.textContent).toContain('Удалённо');
    expect(root.textContent).toContain(
      `Опубликовано ${dateFormatter.format(new Date(task.createdAt))}`,
    );
    expect(root.textContent).toContain('0 откликов');
    expect(root.textContent).toContain('0 просмотров');
  });

  it('should hide the author block when author is missing', () => {
    const root = render(task);

    expect(root.querySelector('.task-item__author')).toBeNull();
  });

  it('should render author name and role when author is present', () => {
    const root = render({ ...task, author });

    expect(root.querySelector('.task-item__author-name')?.textContent).toContain(
      'Иван Петров',
    );
    expect(root.querySelector('.task-item__author-role')?.textContent).toContain(
      'Заказчик',
    );
    expect(root.querySelector('.task-item__avatar')?.textContent).toContain('И');
  });
});
