import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AnalyticsActiveOrdersComponent } from './analytics-active-orders.component';

describe('AnalyticsActiveOrdersComponent testing', () => {
  let fixture: ComponentFixture<AnalyticsActiveOrdersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnalyticsActiveOrdersComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AnalyticsActiveOrdersComponent);
    fixture.detectChanges();
  });

  function root(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  it('should show an empty state and a disabled view-all button', () => {
    const viewAll = root().querySelector('button');

    expect(root().textContent).toContain('Активные заказы');
    expect(root().textContent).toContain('Нет активных заказов');
    expect(root().textContent).toContain('Откликнитесь на задачи, чтобы начать работу');
    expect(viewAll?.textContent?.trim()).toBe('Смотреть все');
    expect(viewAll?.hasAttribute('disabled')).toBe(true);
  });
});
