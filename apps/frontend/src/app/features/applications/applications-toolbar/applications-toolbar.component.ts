import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TaskApplicationStatus } from '@freelance-platform/shared-types';
import {
  APPLICATIONS_ALL_TAB,
  ApplicationsTab,
  ApplicationsTabLabel,
} from '../applications-list.model';

type ApplicationsTabOption = {
  value: ApplicationsTab;
  label: string;
};

@Component({
  selector: 'app-applications-toolbar',
  templateUrl: './applications-toolbar.component.html',
  styleUrl: './applications-toolbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApplicationsToolbarComponent {
  readonly activeTab = input.required<ApplicationsTab>();
  readonly search = input.required<string>();

  readonly tabChange = output<ApplicationsTab>();
  readonly searchChange = output<string>();

  protected readonly tabs: readonly ApplicationsTabOption[] = [
    { value: APPLICATIONS_ALL_TAB, label: ApplicationsTabLabel.All },
    { value: TaskApplicationStatus.Pending, label: ApplicationsTabLabel.Pending },
    { value: TaskApplicationStatus.Accept, label: ApplicationsTabLabel.Accept },
    { value: TaskApplicationStatus.Decline, label: ApplicationsTabLabel.Decline },
  ];

  protected onTabClick(tab: ApplicationsTab): void {
    this.tabChange.emit(tab);
  }

  protected onSearchInput(value: string): void {
    this.searchChange.emit(value);
  }
}
