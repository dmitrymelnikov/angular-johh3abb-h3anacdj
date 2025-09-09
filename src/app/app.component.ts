import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MAT_FAB_DEFAULT_OPTIONS } from '@angular/material/button';
import { MatLine } from '@angular/material/core';
import { MatIcon } from '@angular/material/icon';
import { MatListItem, MatNavList } from '@angular/material/list';
import { MatSidenav, MatSidenavContainer, MatSidenavContent } from '@angular/material/sidenav';
import { MAT_TABS_CONFIG } from '@angular/material/tabs';
import { MatToolbar } from '@angular/material/toolbar';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [
    {
      provide: MAT_TABS_CONFIG,
      useValue: {
        stretchTabs: false,
      },
    },
    {
      provide: MAT_FAB_DEFAULT_OPTIONS,
      useValue: {
        color: 'default',
      },
    },
  ],
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    MatToolbar,
    MatIcon,
    MatSidenavContainer,
    MatSidenav,
    MatNavList,
    MatListItem,
    MatLine,
    MatSidenavContent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {}
