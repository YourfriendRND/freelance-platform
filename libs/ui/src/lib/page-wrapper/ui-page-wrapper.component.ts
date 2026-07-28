import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ui-page-wrapper',
  templateUrl: './ui-page-wrapper.component.html',
  styleUrl: './ui-page-wrapper.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiPageWrapperComponent {}
