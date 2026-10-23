import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppFooterComponent } from '../../../app-footer/app-footer.component';
import { AppHeaderComponent } from '../../../app-header/app-header.component';
import {
  UiPageWrapperComponent,
} from '@freelance-platform/ui';
import { WelcomeHeroComponent } from '../welcome-hero/welcome-hero.component';
import { WelcomePopularCategoriesComponent } from '../welcome-popular-categories/welcome-popular-categories.component';

@Component({
  selector: 'app-welcome-page',
  imports: [
    UiPageWrapperComponent,
    AppHeaderComponent,
    AppFooterComponent,
    WelcomeHeroComponent,
    WelcomePopularCategoriesComponent,
  ],
  templateUrl: './welcome-page.component.html',
  styleUrl: './welcome-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WelcomePageComponent {}
