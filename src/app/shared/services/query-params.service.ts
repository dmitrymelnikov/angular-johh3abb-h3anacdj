import { inject, Injectable } from '@angular/core';
import { ActivatedRoute, ParamMap, Params, Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { debounceTime, filter, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class QueryParamsService {
  private readonly mergeSubject: BehaviorSubject<Params> = new BehaviorSubject<Params>(null);

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  get queryParamMap(): Observable<ParamMap> {
    return this.route.queryParamMap;
  }

  constructor() {
    this.initSubjects();
  }

  getSnapshot(): Params {
    return this.route.snapshot.queryParams;
  }

  merge(params: Params): void {
    this.mergeSubject.next({
      ...this.mergeSubject.value,
      ...params,
    });
  }

  private initSubjects(): void {
    this.mergeSubject
      .pipe(
        filter(Boolean),
        debounceTime(1),
        switchMap((params: Params) =>
          this.router.navigate([], {
            relativeTo: this.route,
            queryParams: params,
            queryParamsHandling: 'merge',
          }),
        ),
      )
      .subscribe(() => {
        this.mergeSubject.next(null);
      });
  }
}
