import { Routes } from '@angular/router';

export const APP_ROUTES: Routes = [
  {
    path: '',
    redirectTo: '/stats',
    pathMatch: 'full',
  },
  {
    path: 'stats',
    loadComponent: () => import('./modules/stats/components/stats.component').then((m) => m.StatsComponent),
  },
  {
    path: 'logger',
    loadComponent: () => import('./modules/logger/components/logger.component').then((m) => m.LoggerComponent),
  },
  {
    path: 'payment',
    loadComponent: () => import('./modules/payment/components/payments.component').then((m) => m.PaymentsComponent),
  },
];
