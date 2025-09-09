import { DestroyRef, Directive, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup } from '@angular/forms';
import { delay, distinctUntilChanged, Observable, Subject, throwError } from 'rxjs';
import { catchError, filter, retry, switchMap, tap } from 'rxjs/operators';

import { ControlsOf } from '../models/controls-of';

@Directive()
export abstract class FilteredAbstractComponent<D, F extends Record<string, unknown> = Record<string, never>>
  implements OnInit
{
  protected filterFormGroup: FormGroup<ControlsOf<F>>;
  private readonly dataUpdateRequested$ = new Subject<void>();

  protected readonly isLoading = signal<boolean>(false);
  protected readonly data = signal<D>(null);

  protected readonly destroyRef = inject(DestroyRef);

  protected createFilters(): FormGroup<ControlsOf<F>> {
    return new FormGroup<ControlsOf<F>>({} as ControlsOf<F>);
  }

  protected abstract loadData(): Observable<D>;

  ngOnInit(): void {
    this.filterFormGroup = this.createFilters();

    this.dataUpdateRequested$
      .asObservable()
      .pipe(
        tap(() => this.isLoading.set(true)),
        switchMap(() => this.loadData()),
        catchError((error) => {
          this.isLoading.set(false);
          return throwError(() => error);
        }),
        tap(() => this.isLoading.set(false)),
        retry(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((data) => {
        this.data.set(data);
      });

    this.filterFormGroup.valueChanges
      .pipe(
        filter(() => this.filterFormGroup.valid),
        distinctUntilChanged(),
        retry(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.dataUpdateRequested$.next(void 0));

    // перше завантаження даних
    this.dataUpdateRequested$.next(void 0);
  }
}
