import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

@Component({
  selector: 'ui-dashboard-wrapper',
  templateUrl: './ui-dashboard-wrapper.component.html',
  styleUrl: './ui-dashboard-wrapper.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiDashboardWrapperComponent {
  protected readonly menuOpen = signal(false);

  protected onToggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  protected onCloseMenu(): void {
    this.menuOpen.set(false);
  }

  protected onSidebarClick(event: MouseEvent): void {
    const target = event.target;

    if (!(target instanceof Element) || !target.closest('a')) {
      return;
    }

    this.onCloseMenu();
  }
}
