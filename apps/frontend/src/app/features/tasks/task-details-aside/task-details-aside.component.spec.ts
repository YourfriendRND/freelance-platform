import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  formatTaskBudget,
  formatTaskDate,
  TaskExecutionType,
  TaskStatus,
  TaskViewData,
} from '@freelance-platform/shared-types';
import { TaskDetailsAsideComponent } from './task-details-aside.component';

describe('TaskDetailsAsideComponent testing', () => {
  let fixture: ComponentFixture<TaskDetailsAsideComponent>;

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

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskDetailsAsideComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskDetailsAsideComponent);
  });

  it('should render budget, deadline and category', () => {
    fixture.componentRef.setInput('task', task);
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;

    expect(root.textContent).toContain('Бюджет');
    expect(root.textContent).toContain('Диапазон бюджета');
    expect(root.textContent).toContain(
      formatTaskBudget(task.budgetMin, task.budgetMax),
    );
    expect(root.textContent).toContain('Срок');
    expect(root.textContent).toContain('Ожидаемое завершение');
    expect(root.textContent).toContain(formatTaskDate(task.deadline));
    expect(root.textContent).toContain('Категория');
    expect(root.querySelector('.task-details-aside__tag')?.textContent).toContain(
      task.categoryTitle,
    );
  });
});
