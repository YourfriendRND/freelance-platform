import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TasksPaginationComponent } from './tasks-pagination.component';

describe('TasksPaginationComponent testing', () => {
  let fixture: ComponentFixture<TasksPaginationComponent>;
  let emittedPages: number[];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TasksPaginationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TasksPaginationComponent);
    emittedPages = [];
    fixture.componentInstance.pageChange.subscribe((page) => {
      emittedPages.push(page);
    });
  });

  function render(currentPage: number, totalPages: number): HTMLElement {
    fixture.componentRef.setInput('currentPage', currentPage);
    fixture.componentRef.setInput('totalPages', totalPages);
    fixture.detectChanges();

    return fixture.nativeElement as HTMLElement;
  }

  function buttonByLabel(root: HTMLElement, label: string): HTMLButtonElement {
    const button = Array.from(root.querySelectorAll('button')).find(
      (item) => item.textContent?.trim() === label,
    );

    if (!button) {
      throw new Error(`Button "${label}" was not found`);
    }

    return button;
  }

  it('should render page buttons and disable previous on the first page', () => {
    const root = render(1, 3);

    expect(buttonByLabel(root, 'Назад').disabled).toBe(true);
    expect(buttonByLabel(root, 'Вперёд').disabled).toBe(false);
    expect(buttonByLabel(root, '1').getAttribute('aria-current')).toBe('page');
    expect(buttonByLabel(root, '2').getAttribute('aria-current')).toBeNull();
  });

  it('should disable next on the last page', () => {
    const root = render(3, 3);

    expect(buttonByLabel(root, 'Назад').disabled).toBe(false);
    expect(buttonByLabel(root, 'Вперёд').disabled).toBe(true);
  });

  it('should emit the next page from the forward button', () => {
    const root = render(1, 3);

    buttonByLabel(root, 'Вперёд').click();

    expect(emittedPages).toEqual([2]);
  });

  it('should emit the previous page from the back button', () => {
    const root = render(2, 3);

    buttonByLabel(root, 'Назад').click();

    expect(emittedPages).toEqual([1]);
  });

  it('should emit a selected page number and ignore the current page', () => {
    const root = render(1, 3);

    buttonByLabel(root, '1').click();
    buttonByLabel(root, '3').click();

    expect(emittedPages).toEqual([3]);
  });

  it('should not emit from disabled navigation buttons', () => {
    const firstPage = render(1, 2);
    buttonByLabel(firstPage, 'Назад').click();

    const lastPage = render(2, 2);
    buttonByLabel(lastPage, 'Вперёд').click();

    expect(emittedPages).toEqual([]);
  });
});
