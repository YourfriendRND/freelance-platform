import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createMockTaskCategoryResponse } from '@freelance-platform/shared-mock';
import { TaskSort, TaskStatus } from '@freelance-platform/shared-types';
import { TasksFiltersComponent } from './tasks-filters.component';
import {
  TASKS_ALL_FILTER_VALUE,
  TasksFiltersSelection,
  toFindTasksQuery,
} from './tasks-filters.model';
import { TASKS_TEST_BUDGET_MAX, TASKS_TEST_BUDGET_MIN } from '../tasks-test.constants';

describe('TasksFiltersComponent testing', () => {
  let fixture: ComponentFixture<TasksFiltersComponent>;
  let emitted: TasksFiltersSelection[];

  const category = createMockTaskCategoryResponse();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TasksFiltersComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TasksFiltersComponent);
    emitted = [];
    fixture.componentInstance.filtersChange.subscribe((query) => {
      emitted.push(query);
    });
    fixture.componentRef.setInput('categories', [category]);
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function root(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  it('should not include draft status', () => {
    expect(root().textContent).not.toContain('Черновик');
  });

  it('should include draft status for my tasks', () => {
    fixture.componentRef.setInput('includeDraft', true);
    fixture.detectChanges();

    expect(root().textContent).toContain('Черновик');
  });

  it('should map numeric budget values from number inputs', () => {
    expect(
      toFindTasksQuery({
        search: '',
        category: TASKS_ALL_FILTER_VALUE,
        status: TASKS_ALL_FILTER_VALUE,
        budgetMin: TASKS_TEST_BUDGET_MIN,
        budgetMax: TASKS_TEST_BUDGET_MAX,
        sort: TaskSort.Newest,
      }),
    ).toEqual({
      budgetMin: TASKS_TEST_BUDGET_MIN,
      budgetMax: TASKS_TEST_BUDGET_MAX,
      sort: TaskSort.Newest,
    });
  });

  it('should emit API filters', async () => {
    vi.useFakeTimers();

    const categorySelect = root().querySelector('#tasks-category') as HTMLSelectElement;
    categorySelect.value = category.id;
    categorySelect.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    const statusSelect = root().querySelector('#tasks-status') as HTMLSelectElement;
    statusSelect.value = TaskStatus.Open;
    statusSelect.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    const budgetMin = root().querySelector('#tasks-budget-min') as HTMLInputElement;
    budgetMin.value = String(TASKS_TEST_BUDGET_MIN);
    budgetMin.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const budgetMax = root().querySelector('#tasks-budget-max') as HTMLInputElement;
    budgetMax.value = String(TASKS_TEST_BUDGET_MAX);
    budgetMax.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await vi.advanceTimersByTimeAsync(300);

    expect(emitted).toEqual([
      {
        categoryId: category.id,
        status: TaskStatus.Open,
        budgetMin: TASKS_TEST_BUDGET_MIN,
        budgetMax: TASKS_TEST_BUDGET_MAX,
        sort: TaskSort.Newest,
      },
    ]);
  });

  it('should emit sort change', async () => {
    vi.useFakeTimers();

    const sortSelect = root().querySelector('#tasks-sort') as HTMLSelectElement;
    sortSelect.value = TaskSort.BudgetDesc;
    sortSelect.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    await vi.advanceTimersByTimeAsync(300);

    expect(emitted).toEqual([
      {
        sort: TaskSort.BudgetDesc,
      },
    ]);
  });
});
