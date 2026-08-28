import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-tasks-pagination',
  templateUrl: './tasks-pagination.component.html',
  styleUrl: './tasks-pagination.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TasksPaginationComponent {
  readonly currentPage = input.required<number>();
  readonly totalPages = input.required<number>();

  readonly pageChange = output<number>();

  protected readonly pages = computed(() =>
    Array.from({ length: this.totalPages() }, (_, index) => index + 1),
  );

  protected readonly isFirstPage = computed(() => this.currentPage() <= 1);

  protected readonly isLastPage = computed(
    () => this.currentPage() >= this.totalPages(),
  );

  protected onPrevious(): void {
    if (this.isFirstPage()) {
      return;
    }

    this.pageChange.emit(this.currentPage() - 1);
  }

  protected onNext(): void {
    if (this.isLastPage()) {
      return;
    }

    this.pageChange.emit(this.currentPage() + 1);
  }

  protected onPage(page: number): void {
    if (page === this.currentPage()) {
      return;
    }

    this.pageChange.emit(page);
  }
}
