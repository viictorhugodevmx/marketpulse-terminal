import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { DashboardComponent } from './features/dashboard/pages/dashboard/dashboard.component';
import { LoginComponent } from './features/auth/pages/login/login.component';
import { WatchlistComponent } from './features/watchlist/pages/watchlist/watchlist.component';
import { PortfolioComponent } from './features/portfolio/pages/portfolio/portfolio.component';
import { RiskCenterComponent } from './features/risk-center/pages/risk-center/risk-center.component';
import { SettingsComponent } from './features/settings/pages/settings/settings.component';
import { InstrumentDetailComponent } from './features/instrument/pages/instrument-detail/instrument-detail.component';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [guestGuard],
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: DashboardComponent,
      },
      {
        path: 'watchlist',
        component: WatchlistComponent,
      },
      {
        path: 'instrument/:symbol',
        component: InstrumentDetailComponent,
      },
      {
        path: 'portfolio',
        component: PortfolioComponent,
      },
      {
        path: 'risk-center',
        component: RiskCenterComponent,
      },
      {
        path: 'settings',
        component: SettingsComponent,
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
