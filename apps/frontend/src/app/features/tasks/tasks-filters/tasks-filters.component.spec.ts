import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createMockTaskCategoryResponse } from '@freelance-platform/shared-mock';
import { TaskSort, TaskStatus } from '@freelance-platform/shared-types';
import { TasksFiltersComponent } from './tasks-filters.component';
import {
  TASKS_ALL_FILTER_VALUE,
  TasksFiltersSelection,
  toFindTasksQuery,
  toMyTasksQuery,
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

  function createFilters(): {
    preset: ComponentFixture<TasksFiltersComponent>;
    emittedSelection: TasksFiltersSelection[];
  } {
    const preset = TestBed.createComponent(TasksFiltersComponent);
    const emittedSelection: TasksFiltersSelection[] = [];

    preset.componentInstance.filtersChange.subscribe((query) => {
      emittedSelection.push(query);
    });

    return { preset, emittedSelection };
  }

  it('should fill the selection without emitting and open the panel', async () => {
    vi.useFakeTimers();
    const { preset, emittedSelection } = createFilters();
    const selection: TasksFiltersSelection = {
      search: 'верстка',
      categoryId: category.id,
      status: TaskStatus.Closed,
      budgetMin: TASKS_TEST_BUDGET_MIN,
      budgetMax: TASKS_TEST_BUDGET_MAX,
      sort: TaskSort.Oldest,
    };

    preset.componentRef.setInput('categories', [category]);
    preset.componentRef.setInput('selection', selection);
    preset.detectChanges();
    await vi.advanceTimersByTimeAsync(300);

    const presetRoot = preset.nativeElement as HTMLElement;

    expect(presetRoot.querySelector<HTMLInputElement>('#tasks-search')?.value).toBe('верстка');
    expect(presetRoot.querySelector<HTMLSelectElement>('#tasks-category')?.value).toBe(category.id);
    expect(presetRoot.querySelector<HTMLSelectElement>('#tasks-status')?.value).toBe(
      TaskStatus.Closed,
    );
    expect(presetRoot.querySelector<HTMLInputElement>('#tasks-budget-min')?.value).toBe(
      String(TASKS_TEST_BUDGET_MIN),
    );
    expect(presetRoot.querySelector<HTMLInputElement>('#tasks-budget-max')?.value).toBe(
      String(TASKS_TEST_BUDGET_MAX),
    );
    expect(presetRoot.querySelector<HTMLSelectElement>('#tasks-sort')?.value).toBe(TaskSort.Oldest);
    expect(presetRoot.querySelector('.tasks-filters__panel')?.classList.contains(
      'tasks-filters__panel--open',
    )).toBe(true);
    expect(emittedSelection).toEqual([]);
  });

  it('should keep the panel closed for search alone', async () => {
    vi.useFakeTimers();
    const { preset, emittedSelection } = createFilters();

    preset.componentRef.setInput('selection', {
      search: 'логотип',
      sort: TaskSort.Newest,
    });
    preset.detectChanges();
    await vi.advanceTimersByTimeAsync(300);

    const presetRoot = preset.nativeElement as HTMLElement;

    expect(presetRoot.querySelector<HTMLInputElement>('#tasks-search')?.value).toBe('логотип');
    expect(presetRoot.querySelector('.tasks-filters__toggle')?.getAttribute('aria-expanded')).toBe(
      'false',
    );
    expect(
      presetRoot.querySelector('.tasks-filters__panel')?.classList.contains(
        'tasks-filters__panel--open',
      ),
    ).toBe(false);
    expect(emittedSelection).toEqual([]);
  });

  it.each<{ selection: TasksFiltersSelection }>([
    { selection: { categoryId: category.id, sort: TaskSort.Newest } },
    { selection: { status: TaskStatus.Open, sort: TaskSort.Newest } },
    { selection: { budgetMin: TASKS_TEST_BUDGET_MIN, sort: TaskSort.Newest } },
    { selection: { budgetMax: TASKS_TEST_BUDGET_MAX, sort: TaskSort.Newest } },
    { selection: { sort: TaskSort.BudgetAsc } },
  ])('should open the panel for a restored filter %#', ({ selection }) => {
    const { preset, emittedSelection } = createFilters();

    preset.componentRef.setInput('categories', [category]);
    preset.componentRef.setInput('selection', selection);
    preset.detectChanges();

    const panel = (preset.nativeElement as HTMLElement).querySelector('.tasks-filters__panel');

    expect(panel?.classList.contains('tasks-filters__panel--open')).toBe(true);
    expect(emittedSelection).toEqual([]);
  });

  it('should apply the category after the category list arrives and keep the panel open', () => {
    const { preset, emittedSelection } = createFilters();

    preset.componentRef.setInput('selection', {
      search: 'черновик',
      categoryId: category.id,
      sort: TaskSort.Newest,
    });
    preset.detectChanges();

    const presetRoot = preset.nativeElement as HTMLElement;

    expect(presetRoot.querySelector<HTMLSelectElement>('#tasks-category')?.value).toBe(
      TASKS_ALL_FILTER_VALUE,
    );
    expect(presetRoot.querySelector('.tasks-filters__panel')?.classList.contains(
      'tasks-filters__panel--open',
    )).toBe(false);

    preset.componentRef.setInput('categories', [category]);
    preset.detectChanges();

    expect(presetRoot.querySelector<HTMLInputElement>('#tasks-search')?.value).toBe('черновик');
    expect(presetRoot.querySelector<HTMLSelectElement>('#tasks-category')?.value).toBe(category.id);
    expect(presetRoot.querySelector('.tasks-filters__panel')?.classList.contains(
      'tasks-filters__panel--open',
    )).toBe(true);

    preset.componentRef.setInput('selection', {
      search: 'логотип',
      sort: TaskSort.Newest,
    });
    preset.detectChanges();

    expect(presetRoot.querySelector<HTMLInputElement>('#tasks-search')?.value).toBe('логотип');
    expect(presetRoot.querySelector('.tasks-filters__panel')?.classList.contains(
      'tasks-filters__panel--open',
    )).toBe(true);
    expect(emittedSelection).toEqual([]);
  });

  it('should toggle the extra filters', () => {
    const toggle = Array.from(root().querySelectorAll('button')).find(
      (button) => button.textContent?.includes('Фильтр'),
    );
    const panel = root().querySelector('.tasks-filters__panel');

    expect(toggle?.getAttribute('aria-expanded')).toBe('false');
    expect(panel?.classList.contains('tasks-filters__panel--open')).toBe(false);

    toggle?.click();
    fixture.detectChanges();

    expect(toggle?.getAttribute('aria-expanded')).toBe('true');
    expect(panel?.classList.contains('tasks-filters__panel--open')).toBe(true);
  });

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

  it('should keep draft status in the my tasks query', () => {
    expect(
      toMyTasksQuery({
        status: TaskStatus.Draft,
        sort: TaskSort.Newest,
      }),
    ).toEqual({
      status: TaskStatus.Draft,
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
