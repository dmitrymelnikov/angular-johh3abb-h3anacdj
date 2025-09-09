import { FormControl } from '@angular/forms';

export type ControlsOf<T> = { [Property in keyof T]: FormControl<T[Property]> };
