import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { TaskCategoryResponse } from '@freelance-platform/shared-types';
import { UiSelectComponent, UiSelectOption } from '@freelance-platform/ui';
import {
  TASKS_ALL_CATEGORIES_OPTION,
  TASKS_SORT_OPTIONS,
  TASKS_STATUS_OPTIONS,
  TasksSortValue,
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

  protected readonly statusOptions = TASKS_STATUS_OPTIONS;
  protected readonly sortOptions = TASKS_SORT_OPTIONS;

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
    category: this.formBuilder.control('all'),
    status: this.formBuilder.control<'all' | string>('all'),
    budgetMin: this.formBuilder.control(''),
    budgetMax: this.formBuilder.control(''),
    sort: this.formBuilder.control<TasksSortValue>('newest'),
  });
}
