import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import {
  formatTaskBudget,
  formatTaskDate,
  TaskStatus,
  TaskViewData,
} from '@freelance-platform/shared-types';
import {
  mockAuthorUserResponse,
  mockTaskViewData,
} from '@freelance-platform/shared-mock';
import { TaskItemComponent } from './task-item.component';

describe('TaskItemComponent testing', () => {
  let fixture: ComponentFixture<TaskItemComponent>;

  const task: TaskViewData = mockTaskViewData;

  const author = mockAuthorUserResponse;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskItemComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskItemComponent);
  });

  function render(data: TaskViewData): HTMLElement {
    fixture.componentRef.setInput('task', data);
    fixture.detectChanges();

    return fixture.nativeElement as HTMLElement;
  }

  it('should render task fields from the card model', () => {
    const root = render(task);

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
      formatTaskBudget(task.budgetMin, task.budgetMax),
    );
    expect(root.querySelector('.task-item__tag')?.textContent).toContain(
      task.categoryTitle,
    );
    expect(root.textContent).toContain('Удалённо');
    expect(root.textContent).toContain(
      `Опубликовано ${formatTaskDate(task.createdAt)}`,
    );
    expect(root.textContent).toContain('0 откликов');
    expect(root.textContent).toContain('0 просмотров');
  });

  it('should link the card to the task details page', () => {
    const root = render(task);
    const link = root.querySelector('a.task-item');

    expect(link?.getAttribute('href')).toBe(`/tasks/${task.id}`);
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
