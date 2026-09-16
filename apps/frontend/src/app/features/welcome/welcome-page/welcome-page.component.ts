import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppFooterComponent } from '../../../app-footer/app-footer.component';
import { AppHeaderComponent } from '../../../app-header/app-header.component';
import {
  UiPageWrapperComponent,
} from '@freelance-platform/ui';

@Component({
  selector: 'app-welcome-page',
  imports: [UiPageWrapperComponent, AppHeaderComponent, AppFooterComponent],
  templateUrl: './welcome-page.component.html',
  styleUrl: './welcome-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WelcomePageComponent {}
