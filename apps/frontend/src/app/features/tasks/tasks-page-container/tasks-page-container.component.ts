import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-tasks-page-container',
  templateUrl: './tasks-page-container.component.html',
  styleUrl: './tasks-page-container.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TasksPageContainerComponent {}
