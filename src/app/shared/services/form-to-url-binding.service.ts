import { inject, Injectable } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { ParamMap } from '@angular/router';
import { combineLatest, debounceTime, distinctUntilChanged, map, Observable, tap } from 'rxjs';
import { ControlToBind } from '../models/control-to-bind.model';
import { QueryParamsService } from './query-params.service';

type Primitive = string | number | boolean | Date;
type ValueType = Primitive | Array<Primitive>;

@Injectable({
  providedIn: 'root',
})
export class FormToUrlBindingService {
  private readonly queryParamsService = inject(QueryParamsService);

  keepBound(form: FormGroup, controls: ControlToBind[]): Observable<void> {
    var controlsMap: Record<string, FormControl> = this.enumerateControls(form);

    return combineLatest(
      controls.map((metadata: ControlToBind) => {
        var control: FormControl = controlsMap[metadata.name];
        if (!control) {
          throw new Error(`Control with name '${metadata.name}' not found in the provided form.`);
        }
        return this.bind(control, metadata);
      }),
    ).pipe(map(() => void 0));
  }

  private enumerateControls(form: FormGroup, parentKey?: string): Record<string, FormControl> {
    let controlsMap: Record<string, FormControl> = {};
    Object.entries(form.controls).forEach(([key, control]: [string, AbstractControl]) => {
      const controlName = parentKey ? `${parentKey}.${key}` : key;
      if (control instanceof FormGroup) {
        Object.assign(controlsMap, this.enumerateControls(control, controlName));
      } else if (control instanceof FormControl) {
        controlsMap[controlName] = control;
      }
    });
    return controlsMap;
  }

  private bind(control: FormControl, metadata: ControlToBind): Observable<void> {
    var paramName: string = metadata.paramName || metadata.name;

    var queryParam$: Observable<void> = this.queryParamsService.queryParamMap.pipe(
      map((paramMap: ParamMap) => paramMap.get(paramName)),
      distinctUntilChanged(),
      map((value: string) => this.deserializeQueryParam(value, metadata)),
      tap((value: ValueType) => {
        control.setValue(value, { emitEvent: false });
      }),
      map(() => void 0),
    );

    var controlValue$: Observable<void> = control.valueChanges.pipe(
      distinctUntilChanged(),
      debounceTime(300),
      tap((value: ValueType) => {
        this.queryParamsService.merge({ [paramName]: this.serializeQueryParam(value, metadata) });
      }),
      map(() => void 0),
    );

    return combineLatest([queryParam$, controlValue$]).pipe(map(() => void 0));
  }

  private serializeQueryParam(value: ValueType, metadata: ControlToBind): string {
    if (value === undefined || value === null) return null;

    switch (metadata.type) {
      case 'string':
        return value ? String(value) : null;
      case 'boolean':
        return value ? String(value) : null;
      case 'number':
        return String(value);
      case 'date':
        return (value as Date).toISOString().split('T')[0];
      case 'string-array':
        return (value as Array<string>).length ? (value as Array<string>)?.join(',') : null;
      case 'object':
        return JSON.stringify(value);
      default:
        throw new Error(`Unsupported type '${metadata.type}' for query param deserialization.`);
    }
  }

  private deserializeQueryParam(value: string, metadata: ControlToBind): ValueType {
    if (!value) return null;

    switch (metadata.type) {
      case 'string':
        return value;
      case 'boolean':
        return value === 'false' ? false : !!value;
      case 'string-array':
        return value?.split(',');
      case 'number':
        return +value;
      case 'date':
        return new Date(value);
      case 'object':
        return JSON.parse(value);
      default:
        throw new Error(`Unsupported type '${metadata.type}' for query param deserialization.`);
    }
  }
}
