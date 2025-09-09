import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
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
import { MatInput } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

import { FilteredAbstractComponent } from '../../../shared/components/filtered-abstract.component';
import { ControlsOf } from '../../../shared/models/controls-of';

export enum PaymentType {
  Ep = 'ep',
  Epu = 'epu',
  Esv = 'esv',
}

export type PaymentModel = {
  type: PaymentType;
  startDate: Date;
  endDate: Date;
  userId: number;
  accountId: number;
};

export type PaymentFiltersModel = Partial<PaymentModel>;

@Component({
  selector: 'payment-payments',
  templateUrl: './payments.component.html',
  styleUrl: './payments.component.scss',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatSelect,
    MatOption,
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
    MatNativeDateModule,
    MatProgressBarModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentsComponent
  extends FilteredAbstractComponent<PaymentModel[], PaymentFiltersModel>
  implements OnInit
{
  protected readonly PaymentType = PaymentType;

  private readonly fb = inject(FormBuilder);

  protected createFilters(): FormGroup<ControlsOf<PaymentFiltersModel>> {
    return this.fb.group<ControlsOf<PaymentFiltersModel>>({
      type: this.fb.control<PaymentType>(null),
      startDate: this.fb.control<Date>(null),
      endDate: this.fb.control<Date>(null),
      accountId: this.fb.control<number>(null),
      userId: this.fb.control<number>(null),
    });
  }

  protected loadData(): Observable<PaymentModel[]> {
    return of([]).pipe(delay(500));
  }
}
