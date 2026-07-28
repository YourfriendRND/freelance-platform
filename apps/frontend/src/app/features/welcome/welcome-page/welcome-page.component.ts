import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  UiFooterComponent,
  UiHeaderComponent,
  UiPageWrapperComponent,
} from '@freelance-platform/ui';

@Component({
  selector: 'app-welcome-page',
  imports: [UiPageWrapperComponent, UiHeaderComponent, UiFooterComponent],
  templateUrl: './welcome-page.component.html',
  styleUrl: './welcome-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WelcomePageComponent {}
