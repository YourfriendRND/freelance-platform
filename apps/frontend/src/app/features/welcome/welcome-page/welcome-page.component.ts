import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppHeaderComponent } from '../../../app-header/app-header.component';
import {
  UiFooterComponent,
  UiPageWrapperComponent,
} from '@freelance-platform/ui';

@Component({
  selector: 'app-welcome-page',
  imports: [UiPageWrapperComponent, AppHeaderComponent, UiFooterComponent],
  templateUrl: './welcome-page.component.html',
  styleUrl: './welcome-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WelcomePageComponent {}
