import { DestroyRef, Directive, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup } from '@angular/forms';
import { distinctUntilChanged, Observable, Subject, throwError } from 'rxjs';
import { catchError, filter, retry, switchMap, tap } from 'rxjs/operators';

import { ControlsOf } from '../models/controls-of';

// Базовий абстрактний класс треба використовувати у випадку якщо вам потрібно реалізувати поліморфізм, тобто
// варіативність реалізації методів для клієнстького коду. У випадку компонентів немає клієнського коду, який би
// користувався цими методами, це є неправильно. У вашому випадку ви лише вирішуєте задачу повторного використання
// коду, ціною значних обмежень або перегрузкою базового компоненту зайвим кодом. Так чи інакше ви або наробите
// багато базових класів, або ваш базовий клас перетвориться в звалище коду. У випадку компонентів краще
// розповсюджувати повторюваний код за допомогою сервісів.
@Directive()
export abstract class FilteredAbstractComponent<D, F extends Record<string, unknown> = Record<string, never>>
  implements OnInit
{
  protected filterFormGroup: FormGroup<ControlsOf<F>>;

  // Оголошення типу з ініціалізацією скіпається лише для примитивів. Для об'єктів треба явно вказувати тип. Тут і
  // далі багато таких моментів.
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

    // 1. Для loader'а краще завести примитив який буде встановлювати флаг в true/false. Окрім того флаг має бути не
    // boolean а number, для одночасного користування декількома observables. Ділюся прикладом:
    /* export class Loading {
       active$: Observable<boolean>;
  
       private counter: number = 0;
  
       private activeSubject: BehaviorSubject<boolean> = new BehaviorSubject(false);
  
       constructor() {
         this.active$ = this.activeSubject.pipe(distinctUntilChanged());
       }
  
       activate<T>(observable$: Observable<T>): Observable<T> {
         this.start();
         return observable$.pipe(
           take(1),
           finalize(() => this.stop()),
         );
       }
  
       start(): void {
         this.counter++;
         this.activeSubject.next(this.counter > 0);
       }
  
       stop(): void {
         this.counter--;
         this.activeSubject.next(this.counter > 0);
       }
     }
  
     export function activateLoading(loading: Loading): <T>(source: Observable<T>) => Observable<T> {
       return function <T>(source: Observable<T>): Observable<T> {
         if (!loading) {
           return source;
         }
  
         return loading.activate(source);
       };
     }
    */

    // І використання:
    /* protected readonly loading: Loading = new Loading();
    
      this.dataUpdateRequested$
      .asObservable()
      .pipe(
        switchMap(() => this.loadData().pipe(activateLoading(this.loading))),
        retry(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((data) => {
        this.data.set(data);
      });
    */

    // 2. Кожен виклик api має супроводжуватися обробкою помилок. Для цього потрібно мати власний клас для
    // помилок, дочірній від Error і кидати цей ApiError з api сервісів. Може бути багато різних апі, з різними
    // стандартами json'у для помилок, а для fontend'у треба все привести до єдиного стандарту у вигляді: class
    // ApiError extends Error. Також треба завести примитив який буде ловити ApiError і показувати повідомлення
    // користувачу:
    /*
      this.dataUpdateRequested$
      .asObservable()
      .pipe(
        switchMap(() => this.loadData().pipe(catchApiError(this.snackbarService))),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((data) => {
        this.data.set(data);
      });
    */

    // 3. Сліпий та бескінчений retry() для API викликів це дуже погана практика.

    // 4. Компоненти не мають загружати дані, це прерогатива компонентів-контейнерів або data-resolver'ів.
    // Компонент контайнер це - компонент з дуже простим view який лише читає path, грузить дані та відає дані
    // дочірнім плоским компонентам які їх відображають

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

    // Виклики АПІ по зміні форми без використання debounceTime(300) це є не добре для бекенду.
    this.filterFormGroup.valueChanges
      .pipe(
        filter(() => this.filterFormGroup.valid),
        distinctUntilChanged(),
        retry(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.dataUpdateRequested$.next(void 0));

    this.dataUpdateRequested$.next(void 0);
  }
}
