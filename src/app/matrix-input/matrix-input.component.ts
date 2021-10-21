import {
  AfterViewInit,
  ChangeDetectionStrategy, ChangeDetectorRef,
  Component,
  ComponentFactory,
  ComponentFactoryResolver,
  ComponentRef,
  OnInit,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import {MatrixRowInputComponent} from "../matrix-row-input/matrix-row-input.component";
import {MatSnackBar, MatSnackBarConfig} from "@angular/material/snack-bar";
import Fraction from "fraction.js";

@Component({
  selector: 'app-matrix-input',
  templateUrl: './matrix-input.component.html',
  styleUrls: ['./matrix-input.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MatrixInputComponent implements OnInit, AfterViewInit {
  private static MIN_ROWS = 1;
  private static MIN_COLS = 2;
  private static MAX_ROWS_WARN = 10;
  private static MAX_COLS_WARN = 10;

  @ViewChild('container', {read: ViewContainerRef})
  public container: ViewContainerRef = undefined as unknown as ViewContainerRef;

  public nCols: number = 0;
  public nRows: number = 0;

  private _matrixRows: ComponentRef<MatrixRowInputComponent>[] = [];
  private readonly _matRowInputFactory: ComponentFactory<MatrixRowInputComponent>;

  constructor(
    componentFactoryResolver: ComponentFactoryResolver,
    private _changeDetectorRef: ChangeDetectorRef,
    private _snackBar: MatSnackBar
  ) {
    this._matRowInputFactory = componentFactoryResolver.resolveComponentFactory(MatrixRowInputComponent);
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    // start with a 2x2 matrix
    // add a timeout to avoid errors of type "view changed"
    setTimeout(() => {
      this.addRow();
      this.addRow();
      this.addCol();
      this.addCol();
    }, 10);
  }

  addRow(): void {
    const matRowInput: ComponentRef<MatrixRowInputComponent> = this.container.createComponent(this._matRowInputFactory);
    matRowInput.instance.nCols = this.nCols;
    this._matrixRows.push(matRowInput);
    this._changeDetectorRef.markForCheck();

    if (this.nRows >= MatrixInputComponent.MAX_ROWS_WARN)
      this.autoDismissSnackBar('That\'s a huge matrix, you can continue, but you\'d better be using more serious software', 'OK');

    ++this.nRows;
  }

  addCol(): void {
    // notify each row it has +1 col
    for (const matRowInput of this._matrixRows)
      ++matRowInput.instance.nCols;

    this._changeDetectorRef.markForCheck();

    if (this.nCols >= MatrixInputComponent.MAX_COLS_WARN)
      this.autoDismissSnackBar('That\'s a huge matrix, you can continue, but you\'d better be using more serious software', 'OK');

    ++this.nCols;
  }

  removeRow(): void {
    if (this.nRows <= MatrixInputComponent.MIN_ROWS) {
      this.autoDismissSnackBar(`There must be at least ${MatrixInputComponent.MIN_ROWS} row`, 'OK', {
        panelClass: 'text-red-600'
      });
      return;
    }

    this.container.remove(this._matrixRows.length - 1);
    this._matrixRows.pop();
    this._changeDetectorRef.markForCheck();

    --this.nRows;
  }

  removeCol(): void {
    if (this.nCols <= MatrixInputComponent.MIN_COLS) {
      this.autoDismissSnackBar(`There must be at least ${MatrixInputComponent.MIN_COLS} columns`, 'OK', {
        panelClass: 'text-red-600'
      });
      return;
    }

    // notify each row it has +1 col
    for (const matRowInput of this._matrixRows)
      --matRowInput.instance.nCols;

    this._changeDetectorRef.markForCheck();

    --this.nCols;
  }

  /**
   * Create a snack bar that will automatically close after a given timeout
   *
   * @param message message to be shown in the snackbar
   * @param action message to be shown in the action of the snackbar
   * @param snackBarConfig configuration for the snack bar
   * @param timeout time in ms to wait before snackbar is dismissed
   */
  public autoDismissSnackBar(
    message: string,
    action?: string,
    snackBarConfig?: MatSnackBarConfig,
    timeout: number = 3_000
  ): void {
    const ref = this._snackBar.open(message, action, snackBarConfig);
    setTimeout(() => ref.dismiss(), timeout);
  }

  public randomFill() {
    for (const matRowInput of this._matrixRows)
      matRowInput.instance.randomFill();
  }

  /**
   * @return the matrix or null if it has invalid entries
   */
  public getMatrix(): Fraction[][] | null {
    const mat: Fraction[][] = [];
    for (const matRowInput of this._matrixRows) {
      const tmpRowValues: Fraction[] | null = matRowInput.instance.getValues();
      if (!tmpRowValues)
        return null;

      mat.push(tmpRowValues);
    }

    return mat;
  }
}
