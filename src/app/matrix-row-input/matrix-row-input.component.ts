import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {FormControl, Validators} from "@angular/forms";

@Component({
  selector: 'app-matrix-row-input',
  templateUrl: './matrix-row-input.component.html',
  styleUrls: ['./matrix-row-input.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MatrixRowInputComponent implements OnInit {
  public formControls: FormControl[] = [];

  private _nCols: number = 0;

  constructor(private _changeDetectorRef: ChangeDetectorRef) { }

  ngOnInit(): void {
  }

  @Input()
  set nCols(cols: number) {
    this._nCols = cols;

    // if the new number of cols is less than the current cols, shrink the array
    if (cols < this.formControls.length)
      this.formControls = this.formControls.slice(0, cols);
    else // if the new number of cols is greater than the current cols, grow the array
      for (let i = this.formControls.length; i < cols; ++i)
        this.formControls.push(new FormControl(undefined, [
          Validators.required,
          Validators.pattern(/^[-+]?\d*(\.\d+)?$/)
        ]));

    this._changeDetectorRef.markForCheck();
  }

  get nCols(): number {
    return this._nCols;
  }

  /**
   * @return true if all the elements in the row are valid, false otherwise
   */
  public isValid(): boolean {
    return this.formControls.every((control: FormControl) => control.valid);
  }

  /**
   * @return null if there is at least one invalid input
   */
  public getValues(): number[] | null {
    return this.formControls.map((formControl: FormControl) => formControl.value);
  }

  /**
   * Fill all inputs with random values
   *
   * WARNING: this will overwrite current values
   */
  public randomFill(): void {
    for (const formControl of this.formControls)
      formControl.setValue(Math.round(Math.random() * 20));
  }
}
