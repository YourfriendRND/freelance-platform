import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppFooterComponent } from '../../../app-footer/app-footer.component';
import {
  UiAuthCardComponent,
  UiAuthContainerComponent,
  UiBrandHeaderComponent,
  UiHeaderComponent,
  UiPageWrapperComponent,
} from '@freelance-platform/ui';
import { LoginFormComponent } from '../login-form/login-form.component';

@Component({
  selector: 'app-login-page',
  imports: [
    RouterLink,
    UiPageWrapperComponent,
    UiHeaderComponent,
    AppFooterComponent,
    UiAuthContainerComponent,
    UiBrandHeaderComponent,
    UiAuthCardComponent,
    LoginFormComponent,
  ],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPageComponent {}
