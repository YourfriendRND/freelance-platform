import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { TaskCategoryApi } from '@freelance-platform/client-api';
import { PopularTaskCategory } from '@freelance-platform/shared-types';
import { catchError, map, of } from 'rxjs';
import {
  formatPopularTaskCount,
  selectPopularCategories,
} from './welcome-popular-categories.model';

@Component({
  selector: 'app-welcome-popular-categories',
  imports: [RouterLink],
  templateUrl: './welcome-popular-categories.component.html',
  styleUrl: './welcome-popular-categories.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WelcomePopularCategoriesComponent {
  private readonly taskCategoryApi = inject(TaskCategoryApi);

  protected readonly formatTaskCount = formatPopularTaskCount;
  protected readonly categories = signal<readonly PopularTaskCategory[]>([]);

  constructor() {
    this.taskCategoryApi
      .findPopular()
      .pipe(
        map((categories) => selectPopularCategories(categories)),
        catchError(() => of<readonly PopularTaskCategory[]>([])),
        takeUntilDestroyed(),
      )
      .subscribe((categories) => {
        this.categories.set(categories);
      });
  }
}
