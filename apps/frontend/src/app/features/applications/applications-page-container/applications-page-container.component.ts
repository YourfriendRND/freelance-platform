import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-applications-page-container',
  templateUrl: './applications-page-container.component.html',
  styleUrl: './applications-page-container.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApplicationsPageContainerComponent {}
