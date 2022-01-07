import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ComponentFactory,
  ComponentFactoryResolver,
  ElementRef,
  Inject,
  PLATFORM_ID,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import {MatrixInputComponent} from "./matrix-input/matrix-input.component";
import {MatSnackBar} from "@angular/material/snack-bar";
import {RowReducer} from "./RowReducer";
import {EOpMult, EOpMultSum, EOpSwap} from "./operations";
import {MatrixComponent} from "./matrix/matrix.component";
import {OperationsComponent} from "./operations/operations.component";
import Fraction from "fraction.js";
import {render} from "katex";
import {isPlatformBrowser} from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements AfterViewInit {
  @ViewChild('matrixInput')
  public matrixInput: MatrixInputComponent = undefined as unknown as MatrixInputComponent;

  @ViewChild('stepsContainer', {read: ViewContainerRef})
  public stepsContainer: ViewContainerRef = undefined as unknown as ViewContainerRef;

  @ViewChild('swapOpSummary')
  public swapOpSummary: ElementRef = undefined as unknown as ElementRef;

  @ViewChild('multOpSummary')
  public multOpSummary: ElementRef = undefined as unknown as ElementRef;

  @ViewChild('multSumOpSummary')
  public multSumOpSummary: ElementRef = undefined as unknown as ElementRef;

  public isComputing: boolean = false;
  public opsSummary: OpSummary = {
    swap: 0,
    mult: 0,
    multSum: 0,
    total: 0
  };

  public isSummaryShown: boolean = false;

  private readonly _matrixComponentFactory: ComponentFactory<MatrixComponent>;
  private readonly _operationsComponentFactory: ComponentFactory<OperationsComponent>;

  private _mat: Fraction[][] | null = null;

  constructor(
    componentFactoryResolver: ComponentFactoryResolver,
    private _snackBar: MatSnackBar,
    private _changeDetectorRef: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this._matrixComponentFactory = componentFactoryResolver.resolveComponentFactory(MatrixComponent);
    this._operationsComponentFactory = componentFactoryResolver.resolveComponentFactory(OperationsComponent);
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      render('R_i \\leftrightarrow R_j', this.swapOpSummary.nativeElement);
      render('c R_i \\rightarrow R_i', this.multOpSummary.nativeElement);
      render('R_j + c R_i \\rightarrow R_j', this.multSumOpSummary.nativeElement);
    }
  }

  /**
   * @param rref same as {@link RowReducer#reduce}
   */
  public reduce(rref: boolean = true) {
    this._mat = this.matrixInput.getMatrix();
    if (!this._mat) {
      this._snackBar.open('Matrix is not valid. Remember all fields are required and must be valid numbers', 'OK', {
        panelClass: 'text-red-500'
      });
      return;
    }

    // reset
    this.opsSummary.total = 0;
    this.opsSummary.multSum = 0;
    this.opsSummary.mult = 0;
    this.opsSummary.swap = 0;
    this._snackBar.dismiss();
    this.stepsContainer.clear();
    this.isSummaryShown = false;
    this.isComputing = true;
    this._changeDetectorRef.markForCheck();

    this.printMatrix(this._mat);

    const reducer = new RowReducer(
      this._mat,
      (arg) => this.printMatrix(arg),
      (arg) => this.printSwapOp(arg),
      (arg) => this.printMultOp(arg),
      (arg) => this.printMultSumOps(arg)
    );
    reducer.reduce(rref);

    this.isSummaryShown = true;
    this.isComputing = false;
    this._changeDetectorRef.markForCheck();
  }

  public printMatrix(mat: Fraction[][]) {
    const matComponent = this.stepsContainer.createComponent(this._matrixComponentFactory);
    matComponent.instance.matrix = mat.map(row => row.map(entry => entry));
    this._changeDetectorRef.markForCheck();
  }

  public printSwapOp(op: EOpSwap) {
    if (!this._mat)
      return;

    const opsComponent = this.stepsContainer.createComponent(this._operationsComponentFactory);
    const ops: EOpSwap[] = [];
    for (let i = 0; i < this._mat.length; ++i)
      if (op.Ri === i)
        ops[i] = op;

    opsComponent.instance.ops = ops;
    opsComponent.instance.heightClass = 'h-8';
    ++this.opsSummary.swap;
    ++this.opsSummary.total;
  }

  public printMultOp(op: EOpMult) {
    if (!this._mat)
      return;

    const opsComponent = this.stepsContainer.createComponent(this._operationsComponentFactory);
    const ops: EOpMult[] = [];
    for (let i = 0; i < this._mat.length; ++i)
      if (op.Ri === i)
        ops[i] = op;

    opsComponent.instance.ops = ops;
    opsComponent.instance.heightClass = 'h-8';
    ++this.opsSummary.mult;
    ++this.opsSummary.total;
  }

  public printMultSumOps(ops: EOpMultSum[]) {
    const opsComponent = this.stepsContainer.createComponent(this._operationsComponentFactory);

    opsComponent.instance.ops = ops;
    opsComponent.instance.heightClass = 'h-8';
    const nOperations = ops.filter(op => !!op).length;
    this.opsSummary.multSum += nOperations;
    this.opsSummary.total += nOperations;
  }
}

/**
 * Operations summary
 */
interface OpSummary {
  swap: number;
  mult: number;
  multSum: number;
  total: number;
}
