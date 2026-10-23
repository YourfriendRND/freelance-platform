import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { createMockTaskApplicationResponse } from '@freelance-platform/shared-mock';
import { TaskApplicationStatus } from '@freelance-platform/shared-types';
import { formatTaskDate } from '../../../format';
import { AnalyticsRequestStatus, selectRecentApplications } from '../analytics-freelancer.model';
import { AnalyticsRecentApplicationsComponent } from './analytics-recent-applications.component';

describe('AnalyticsRecentApplicationsComponent testing', () => {
  let fixture: ComponentFixture<AnalyticsRecentApplicationsComponent>;

  const application = createMockTaskApplicationResponse({
    proposedPrice: 2800,
    createdAt: '2026-05-28T12:00:00.000Z',
    status: TaskApplicationStatus.Pending,
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnalyticsRecentApplicationsComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(AnalyticsRecentApplicationsComponent);
  });

  function root(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  it('should render the task, status, date and price', () => {
    const [recent] = selectRecentApplications([application]);

    if (!recent) {
      throw new Error('Отклик не собран');
    }

    fixture.componentRef.setInput('status', AnalyticsRequestStatus.Ready);
    fixture.componentRef.setInput('applications', [
      { ...recent, taskTitle: 'Современный интернет-магазин' },
    ]);
    fixture.detectChanges();

    const text = root().textContent ?? '';
    const price = new Intl.NumberFormat('ru-RU').format(2800);

    expect(text).toContain('Последние отклики');
    expect(text).toContain('Современный интернет-магазин');
    expect(text).toContain('На рассмотрении');
    expect(text).toContain(`Отправлен ${formatTaskDate(application.createdAt)}`);
    expect(text).toContain(`${price} ₽`);
    expect(root().querySelector('a[href="/applications"]')?.textContent).toContain(
      'Смотреть все',
    );
  });

  it('should render an empty state', () => {
    fixture.componentRef.setInput('status', AnalyticsRequestStatus.Ready);
    fixture.componentRef.setInput('applications', []);
    fixture.detectChanges();

    expect(root().textContent).toContain('Откликов пока нет');
  });

  it('should render a dash when the price is missing', () => {
    const [recent] = selectRecentApplications([
      createMockTaskApplicationResponse({ proposedPrice: null }),
    ]);

    if (!recent) {
      throw new Error('Отклик не собран');
    }

    fixture.componentRef.setInput('status', AnalyticsRequestStatus.Ready);
    fixture.componentRef.setInput('applications', [
      { ...recent, taskTitle: 'Задача без цены' },
    ]);
    fixture.detectChanges();

    expect(root().textContent).toContain('—');
  });
});
