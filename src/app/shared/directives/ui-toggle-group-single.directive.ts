import { AfterContentInit, contentChildren, DestroyRef, Directive, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonToggle, MatButtonToggleGroup } from '@angular/material/button-toggle';

// Тут має бути імплементовано ControlValueAccessor для взаімодії з зовнішньою формою. Вся внутрішня/зовнішня
// взаємодія через FormControl.
@Directive({
  selector: '[uiSingle]',
})
export class UiToggleGroupSingleDirective implements OnInit, AfterContentInit {
  private readonly hostToggleGroupComponent = inject(MatButtonToggleGroup, {
    host: true,
    self: true,
    optional: true,
  });
  private readonly destroyRef = inject(DestroyRef);

  private readonly buttonToggles = contentChildren<MatButtonToggle>(MatButtonToggle);

  private previousValue: unknown;

  ngOnInit(): void {
    this.previousValue = this.hostToggleGroupComponent.value;
  }

  ngAfterContentInit(): void {
    this.buttonToggles().forEach((button) => {
      button.change
        .asObservable()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((change) => {
          if (this.previousValue === change.value) {
            this.hostToggleGroupComponent.value = undefined;
            this.hostToggleGroupComponent._emitChangeEvent(button);
            this.previousValue = undefined;
          } else {
            this.previousValue = change.value;
          }
        });
    });
  }
}
