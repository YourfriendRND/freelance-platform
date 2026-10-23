import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  OnInit,
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
  toTasksFiltersSelection,
} from './tasks-filters.model';

@Component({
  selector: 'app-tasks-filters',
  imports: [ReactiveFormsModule, UiSelectComponent],
  templateUrl: './tasks-filters.component.html',
  styleUrl: './tasks-filters.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TasksFiltersComponent implements OnInit {
  private readonly formBuilder = inject(NonNullableFormBuilder);

  readonly categories = input<readonly TaskCategoryResponse[]>([]);
  readonly shownCount = input(0);
  readonly totalCount = input(0);
  readonly includeDraft = input(false);
  readonly initialCategoryId = input<string | null>(null);

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

  private applyInitialCategory = (): void => undefined;

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

  ngOnInit(): void {
    this.applyInitialCategory();
  }

  constructor() {
    let lastQuery = toTasksFiltersSelection(this.form.getRawValue());
    let categoryApplied = false;

    this.applyInitialCategory = () => {
      const categoryId = this.initialCategoryId();
      const categoryKnown = this.categories().some((category) => category.id === categoryId);

      if (!categoryId || !categoryKnown || categoryApplied) {
        return;
      }

      categoryApplied = true;
      this.form.controls.category.setValue(categoryId, { emitEvent: false });
      lastQuery = toTasksFiltersSelection(this.form.getRawValue());
    };

    effect(() => {
      this.applyInitialCategory();
    });

    this.form.valueChanges
      .pipe(
        debounceTime(300),
        map(() => toTasksFiltersSelection(this.form.getRawValue())),
        filter((query) => !isSameTasksFiltersSelection(query, lastQuery)),
        takeUntilDestroyed(),
      )
      .subscribe((query) => {
        lastQuery = query;
        this.filtersChange.emit(query);
      });
  }

  protected onToggleFilters(): void {
    this.filtersOpen.update((open) => !open);
  }
}
