import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ComponentFactory,
  ComponentFactoryResolver,
  ElementRef,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import {MatrixInputComponent} from "./matrix-input/matrix-input.component";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Solver} from "./Solver";
import {EOpMult, EOpMultSum, EOpSwap} from "./operations";
import {MatrixComponent} from "./matrix/matrix.component";
import {OperationsComponent} from "./operations/operations.component";
import Fraction from "fraction.js";
import {render} from "katex";

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

  public computing: boolean = false;
  public opsSummary: OpSummary = {
    swap: 0,
    mult: 0,
    multSum: 0,
    total: 0
  };

  public shouldShowSummary: boolean = false;

  private readonly _matrixComponentFactory: ComponentFactory<MatrixComponent>;
  private readonly _operationsComponentFactory: ComponentFactory<OperationsComponent>;

  private _mat: Fraction[][] | null = null;

  constructor(
    componentFactoryResolver: ComponentFactoryResolver,
    private _snackBar: MatSnackBar,
    private _changeDetectorRef: ChangeDetectorRef
  ) {
    this._matrixComponentFactory = componentFactoryResolver.resolveComponentFactory(MatrixComponent);
    this._operationsComponentFactory = componentFactoryResolver.resolveComponentFactory(OperationsComponent);
  }

  ngAfterViewInit(): void {
    render('R_i \\leftrightarrow R_j', this.swapOpSummary.nativeElement);
    render('c R_i \\rightarrow R_i', this.multOpSummary.nativeElement);
    render('R_j + c R_i \\rightarrow R_j', this.multSumOpSummary.nativeElement);
  }

  /**
   * @param rref same as {@link Solver#reduce}
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
    this.shouldShowSummary = false;
    this.computing = true;
    this._changeDetectorRef.markForCheck();

    this.printMatrix(this._mat);

    const solver = new Solver(
      this._mat,
      (arg) => this.printMatrix(arg),
      (arg) => this.printSwapOp(arg),
      (arg) => this.printMultOp(arg),
      (arg) => this.printMultSumOps(arg)
    );
    let i = 0;
    while (solver.reduce(rref)); // reduce until rref is obtained

    // show summary
    this.shouldShowSummary = true;

    this.computing = false;
    this._changeDetectorRef.markForCheck();
  }

  public printMatrix(mat: Fraction[][]) {
    console.table(mat);
    const matComponent = this.stepsContainer.createComponent(this._matrixComponentFactory);
    matComponent.instance.matrix = mat.map(row => row.map(entry => entry)); // didn't have time to deep-copy the right way
  }

  public printSwapOp(op: EOpSwap) {
    console.log("Swap", op);
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
    console.log("Mult", op);
    if (!this._mat)
      return;

    const opsComponent = this.stepsContainer.createComponent(this._operationsComponentFactory);
    const ops: EOpSwap[] = [];
    for (let i = 0; i < this._mat.length; ++i)
      if (op.Ri === i)
        ops[i] = op;

    opsComponent.instance.ops = ops;
    opsComponent.instance.heightClass = 'h-8';
    ++this.opsSummary.mult;
    ++this.opsSummary.total;
  }

  public printMultSumOps(ops: EOpMultSum[]) {
    console.log("Mult sum", ops);

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
