import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-analytics-active-orders',
  templateUrl: './analytics-active-orders.component.html',
  styleUrl: './analytics-active-orders.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnalyticsActiveOrdersComponent {
  // TODO: Показать активные заказы, когда появится сущность orders
}
