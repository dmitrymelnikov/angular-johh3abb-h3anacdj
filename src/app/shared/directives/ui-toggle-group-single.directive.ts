import { AfterContentInit, contentChildren, DestroyRef, Directive, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonToggle, MatButtonToggleGroup } from '@angular/material/button-toggle';

/**
 * Директива для mat-button-toggle-group, що дозволяє вимикати вибраний toggle-button
 * У звичайному режимі після першого вибору опції її вже не можна скинути, тільки переключити на іншу
 */
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
    // підписуємось на change подію кожної окремої кнопки
    this.buttonToggles().forEach((button) => {
      button.change
        .asObservable()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((change) => {
          if (this.previousValue === change.value) {
            // клікнутий button-toggle, який уже й так увімкнено
            // інтерпретуємо це як скидання
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
