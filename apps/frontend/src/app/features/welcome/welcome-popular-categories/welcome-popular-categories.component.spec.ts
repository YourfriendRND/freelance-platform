import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TaskCategoryApi } from '@freelance-platform/client-api';
import { of, throwError } from 'rxjs';
import { WelcomePopularCategoriesComponent } from './welcome-popular-categories.component';
import { createMockCategory } from './welcome-popular-categories.mock';

describe('WelcomePopularCategoriesComponent testing', () => {
  let fixture: ComponentFixture<WelcomePopularCategoriesComponent>;
  let findPopular: ReturnType<typeof vi.fn>;

  async function setup(result: ReturnType<typeof vi.fn>): Promise<void> {
    findPopular = result;

    await TestBed.configureTestingModule({
      imports: [WelcomePopularCategoriesComponent],
      providers: [
        provideRouter([]),
        {
          provide: TaskCategoryApi,
          useValue: { findPopular },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WelcomePopularCategoriesComponent);
    fixture.detectChanges();
  }

  function root(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  it('should hide the block when fewer than 4 categories have tasks', async () => {
    await setup(vi.fn(() => of([createMockCategory(1), createMockCategory(2, 0), createMockCategory(3)])));

    expect(findPopular).toHaveBeenCalledTimes(1);
    expect(root().textContent).not.toContain('Популярные категории');
  });

  it('should show the first 4 categories when the list is shorter than 8', async () => {
    await setup(
      vi.fn(() =>
        of([
          createMockCategory(1, 10),
          createMockCategory(2, 10),
          createMockCategory(3, 10),
          createMockCategory(4, 10),
          createMockCategory(5, 10),
        ]),
      ),
    );

    const links = Array.from(root().querySelectorAll('a'));

    expect(root().textContent).toContain('Популярные категории');
    expect(root().textContent).toContain('Смотрите задачи в разных категориях');
    expect(root().textContent).toContain('10 задач');
    expect(links).toHaveLength(4);
    expect(links[0]?.getAttribute('href')).toBe(
      '/tasks?categoryId=category-1',
    );
    expect(root().textContent).not.toContain('Категория 5');
  });

  it('should show 8 categories', async () => {
    await setup(vi.fn(() => of(Array.from({ length: 8 }, (_, index) => createMockCategory(index + 1)))));

    expect(root().querySelectorAll('a')).toHaveLength(8);
    expect(root().textContent).toContain('Категория 8');
  });

  it('should hide the block when the request fails', async () => {
    await setup(vi.fn(() => throwError(() => new Error('offline'))));

    expect(root().textContent ?? '').not.toContain('Популярные категории');
  });
});
