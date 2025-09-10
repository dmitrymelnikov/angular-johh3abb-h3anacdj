import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatBadge } from '@angular/material/badge';
import { MatButton } from '@angular/material/button';
import { MatButtonToggle, MatButtonToggleGroup } from '@angular/material/button-toggle';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import {
  MatDatepickerActions,
  MatDatepickerApply,
  MatDatepickerCancel,
  MatDatepickerToggle,
  MatDateRangeInput,
  MatDateRangePicker,
  MatEndDate,
  MatStartDate,
} from '@angular/material/datepicker';
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

import { FilteredAbstractComponent } from '../../../shared/components/filtered-abstract.component';
import { UiToggleGroupSingleDirective } from '../../../shared/directives/ui-toggle-group-single.directive';

import { ControlsOf } from '../../../shared/models/controls-of';
import { FormToUrlBindingService } from '../../../shared/services/form-to-url-binding.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlToBind } from '../../../shared/models/control-to-bind.model';

export type LoggerModel = {
  accountId: number;
  needToFix: boolean;
  level: string[];
  title: string;
  datetime: Date;
};

export type LoggerFiltersModel = Partial<
  Omit<LoggerModel, 'datetime'> & {
    createdDateFrom: Date;
    createdDateTo: Date;
  }
>;

@Component({
  selector: 'logger',
  templateUrl: './logger.component.html',
  styleUrls: ['./logger.component.scss'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatSuffix,
    MatDateRangeInput,
    MatStartDate,
    MatEndDate,
    MatDatepickerToggle,
    MatDateRangePicker,
    MatDatepickerActions,
    MatButton,
    MatDatepickerCancel,
    MatDatepickerApply,
    MatBadge,
    MatButtonToggleGroup,
    MatButtonToggle,
    MatNativeDateModule,
    MatProgressBarModule,
    UiToggleGroupSingleDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoggerComponent extends FilteredAbstractComponent<LoggerModel[], LoggerFiltersModel> implements OnInit {
  protected needFixCount = signal<number>(1);

  private readonly fb = inject(FormBuilder);

  private readonly formToUrlBindingService = inject(FormToUrlBindingService);

  override ngOnInit(): void {
    super.ngOnInit();

    this.formToUrlBindingService
      .keepBound(this.filterFormGroup, [
        { name: 'accountId', paramName: 'account', type: 'number' },
        { name: 'needToFix', paramName: 'not-fixed', type: 'boolean' },
        { name: 'level', paramName: 'level', type: 'string-array' },
        { name: 'title', paramName: 'title', type: 'string' },
        { name: 'createdDateFrom', paramName: 'from', type: 'date' },
        { name: 'createdDateTo', paramName: 'to', type: 'date' },
      ])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  protected createFilters(): FormGroup<ControlsOf<LoggerFiltersModel>> {
    return this.fb.group<ControlsOf<LoggerFiltersModel>>({
      accountId: this.fb.control<number>(null),
      needToFix: this.fb.control<boolean>(null),
      level: this.fb.control<string[]>(null),
      title: this.fb.control<string>(null),
      createdDateFrom: this.fb.control<Date>(null),
      createdDateTo: this.fb.control<Date>(null),
    });
  }

  protected loadData(): Observable<LoggerModel[]> {
    return of([]).pipe(delay(500));
  }
}
