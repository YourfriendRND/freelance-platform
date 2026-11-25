import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import {
  TASK_STATUS_LABEL,
  TaskCategoryResponse,
  TaskSort,
  TaskStatus,
} from '@freelance-platform/shared-types';
import { UiSelectComponent, UiSelectOption } from '@freelance-platform/ui';
import { debounceTime, filter, map } from 'rxjs';
import {
  isSameTasksFiltersSelection,
  TASKS_ALL_CATEGORIES_OPTION,
  TASKS_ALL_FILTER_VALUE,
  TASKS_SORT_OPTIONS,
  TASKS_STATUS_OPTIONS,
  TasksFiltersFormValue,
  TasksFiltersSelection,
  toTasksFiltersFormValue,
  toTasksFiltersSelection,
} from './tasks-filters.model';

@Component({
  selector: 'app-tasks-filters',
  imports: [ReactiveFormsModule, UiSelectComponent],
  templateUrl: './tasks-filters.component.html',
  styleUrl: './tasks-filters.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TasksFiltersComponent {
  private readonly formBuilder = inject(NonNullableFormBuilder);

  readonly categories = input<readonly TaskCategoryResponse[]>([]);
  readonly shownCount = input(0);
  readonly totalCount = input(0);
  readonly includeDraft = input(false);
  readonly selection = input<TasksFiltersSelection | null>(null);

  readonly filtersChange = output<TasksFiltersSelection>();

  protected readonly filtersOpen = signal(false);

  protected readonly sortOptions = TASKS_SORT_OPTIONS;

  protected readonly statusOptions = computed<readonly UiSelectOption[]>(() => {
    if (!this.includeDraft()) {
      return TASKS_STATUS_OPTIONS;
    }

    return [
      ...TASKS_STATUS_OPTIONS,
      { value: TaskStatus.Draft, label: TASK_STATUS_LABEL[TaskStatus.Draft] },
    ];
  });

  protected readonly categoryOptions = computed<readonly UiSelectOption[]>(
    () => [
      TASKS_ALL_CATEGORIES_OPTION,
      ...this.categories().map(({ id, title }) => ({
        value: id,
        label: title,
      })),
    ],
  );

  protected readonly form = this.formBuilder.group({
    search: this.formBuilder.control(''),
    category: this.formBuilder.control(TASKS_ALL_FILTER_VALUE),
    status: this.formBuilder.control<TasksFiltersFormValue['status']>(
      TASKS_ALL_FILTER_VALUE,
    ),
    budgetMin: this.formBuilder.control<number | null>(null),
    budgetMax: this.formBuilder.control<number | null>(null),
    sort: this.formBuilder.control<TaskSort>(TaskSort.Newest),
  });

  private lastSelection = toTasksFiltersSelection(this.form.getRawValue());

  constructor() {
    effect(() => {
      this.applySelection();
    });

    this.form.valueChanges
      .pipe(
        debounceTime(300),
        map(() => toTasksFiltersSelection(this.form.getRawValue())),
        filter((query) => !isSameTasksFiltersSelection(query, this.lastSelection)),
        takeUntilDestroyed(),
      )
      .subscribe((query) => {
        this.lastSelection = query;
        this.filtersChange.emit(query);
      });
  }

  protected onToggleFilters(): void {
    this.filtersOpen.update((open) => !open);
  }

  private applySelection(): void {
    const next = this.selection();
    const categories = this.categories();

    if (!next) {
      return;
    }

    const applicable = this.applicableSelection(next, categories);

    if (isSameTasksFiltersSelection(applicable, this.lastSelection)) {
      return;
    }

    this.form.patchValue(toTasksFiltersFormValue(applicable), { emitEvent: false });
    this.lastSelection = toTasksFiltersSelection(this.form.getRawValue());

    if (this.selectionOpensPanel(applicable)) {
      this.filtersOpen.set(true);
    }
  }

  private applicableSelection(
    selection: TasksFiltersSelection,
    categories: readonly TaskCategoryResponse[],
  ): TasksFiltersSelection {
    const categoryKnown = categories.some((category) => category.id === selection.categoryId);

    if (selection.categoryId === undefined || categoryKnown) {
      return selection;
    }

    return {
      search: selection.search,
      status: selection.status,
      budgetMin: selection.budgetMin,
      budgetMax: selection.budgetMax,
      sort: selection.sort,
    };
  }

  private selectionOpensPanel(selection: TasksFiltersSelection): boolean {
    return (
      selection.categoryId !== undefined ||
      selection.status !== undefined ||
      selection.budgetMin !== undefined ||
      selection.budgetMax !== undefined ||
      selection.sort !== TaskSort.Newest
    );
  }
}
