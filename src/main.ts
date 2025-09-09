import { DEFAULT_CURRENCY_CODE, LOCALE_ID } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';

import { AppComponent } from './app/app.component';

import { APP_ROUTES } from './app/app.routing';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(APP_ROUTES),
    { provide: LOCALE_ID, useValue: 'uk-UA' },
    { provide: DEFAULT_CURRENCY_CODE, useValue: '₴' },
    provideAnimations(),
  ],
}).catch((err) => console.error(err));
