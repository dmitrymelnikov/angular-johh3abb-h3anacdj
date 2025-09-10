import { ChangeDetectionStrategy, Component, inject, OnInit, signal, effect } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonToggle, MatButtonToggleGroup } from '@angular/material/button-toggle';
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
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { delay, distinctUntilChanged, Observable, of } from 'rxjs';

import { FilteredAbstractComponent } from '../../../shared/components/filtered-abstract.component';
import { UiToggleGroupSingleDirective } from '../../../shared/directives/ui-toggle-group-single.directive';

import { ControlsOf } from '../../../shared/models/controls-of';
import { FormToUrlBindingService } from '../../../shared/services/form-to-url-binding.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export type StatsModel = {};

export type StatsFiltersModel = Partial<{
  dateFrom: Date;
  dateTo: Date;
  compareDateFrom: Date;
  compareDateTo: Date;
}>;

@Component({
  selector: 'stats-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatDateRangeInput,
    MatStartDate,
    MatEndDate,
    MatDatepickerToggle,
    MatSuffix,
    MatDateRangePicker,
    MatDatepickerActions,
    MatButton,
    MatDatepickerCancel,
    MatDatepickerApply,
    MatButtonToggleGroup,
    MatButtonToggle,
    MatNativeDateModule,
    MatProgressBarModule,
    UiToggleGroupSingleDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatsComponent extends FilteredAbstractComponent<StatsModel[], StatsFiltersModel> implements OnInit {
  protected isCompareMode = signal<boolean>(false);

  private readonly fb = inject(FormBuilder);

  private readonly formToUrlBindingService = inject(FormToUrlBindingService);

  constructor() {
    super();

    effect(() => {
      const isCompare = this.isCompareMode();
      if (isCompare) {
        this.filterFormGroup.get('compareDateFrom').enable({ emitEvent: false });
        this.filterFormGroup.get('compareDateTo').enable({ emitEvent: false });
      } else {
        this.filterFormGroup.get('compareDateFrom').disable({ emitEvent: false });
        this.filterFormGroup.get('compareDateTo').disable({ emitEvent: false });
        this.filterFormGroup.get('compareDateFrom').reset(null);
        this.filterFormGroup.get('compareDateTo').reset(null);
      }
    });
  }

  override ngOnInit(): void {
    super.ngOnInit();

    this.formToUrlBindingService
      .keepBound(this.filterFormGroup, [
        { name: 'dateFrom', paramName: 'from', type: 'date' },
        { name: 'dateTo', paramName: 'to', type: 'date' },
        { name: 'compareDateFrom', paramName: 'compareFrom', type: 'date' },
        { name: 'compareDateTo', paramName: 'compareTo', type: 'date' },
      ])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();

    // Довелося сінхронізувати isCompareMode сігнал із формою, бо інакше при завантаженні сторінки з
    // параметрами compareFrom/compareTo форма ініціалізувалася б, а isCompareMode залишався б false
    // і відповідні поля були б задизейблені. Краще уникати такого і прив'язувати стан форми лише до FormControl'ів.
    this.filterFormGroup
      .get('compareDateFrom')
      .valueChanges.pipe(distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((value?: Date) => {
        this.isCompareMode.set(!!value);
      });
    this.isCompareMode.set(!!this.filterFormGroup.get('compareDateFrom').value);
  }

  protected createFilters(): FormGroup<ControlsOf<StatsFiltersModel>> {
    const today = new Date();
    return this.fb.group<ControlsOf<StatsFiltersModel>>({
      dateFrom: this.fb.control<Date>(
        new Date(today.getFullYear(), today.getMonth(), today.getDate() - 14),
        Validators.required,
      ),
      dateTo: this.fb.control<Date>(today, Validators.required),
      compareDateFrom: this.fb.control<Date>({ value: null, disabled: true }, Validators.required),
      compareDateTo: this.fb.control<Date>({ value: null, disabled: true }, Validators.required),
    });
  }

  protected toggleCompare(): void {
    this.isCompareMode.set(!this.isCompareMode());
  }

  protected loadData(): Observable<StatsModel[]> {
    return of([]).pipe(delay(500));
  }
}
