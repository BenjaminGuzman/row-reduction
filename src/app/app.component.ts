import {
  ChangeDetectionStrategy,
  Component,
  ComponentFactory,
  ComponentFactoryResolver,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import {MatrixInputComponent} from "./matrix-input/matrix-input.component";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Solver} from "./Solver";
import {EOpMult, EOpMultSum, EOpSwap} from "./operations";
import {MatrixComponent} from "./matrix/matrix.component";
import {OperationsComponent} from "./operations/operations.component";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  @ViewChild('matrixInput')
  public matrixInput: MatrixInputComponent = undefined as unknown as MatrixInputComponent;

  @ViewChild('stepsContainer', {read: ViewContainerRef})
  public stepsContainer: ViewContainerRef = undefined as unknown as ViewContainerRef;

  private readonly _matrixComponentFactory: ComponentFactory<MatrixComponent>;
  private readonly _operationsComponentFactory: ComponentFactory<OperationsComponent>;

  private _mat: number[][] | null = null;

  constructor(componentFactoryResolver: ComponentFactoryResolver, private _snackBar: MatSnackBar) {
    this._matrixComponentFactory = componentFactoryResolver.resolveComponentFactory(MatrixComponent);
    this._operationsComponentFactory = componentFactoryResolver.resolveComponentFactory(OperationsComponent);
  }

  public reduceGauss() {
    const snack = this._snackBar.open('Feature not ready yet. Coming soon!', 'OK');
    setTimeout(() => snack.dismiss(), 3_000);
    return;
  }

  public reduceGaussJordan() {
    this._mat = this.matrixInput.getMatrix();
    if (!this._mat) {
      this._snackBar.open('Matrix is not valid. Remember all fields are required and must be valid numbers', 'OK', {
        panelClass: 'text-red-500'
      });
      return;
    }
    this._snackBar.dismiss();
    this.stepsContainer.clear();

    this.printMatrix(this._mat);

    const solver = new Solver(
      this._mat,
      (arg) => this.printMatrix(arg),
      (arg) => this.printSwapOp(arg),
      (arg) => this.printMultOp(arg),
      (arg) => this.printMultSumOps(arg)
    );
    while (solver.reduce()); // reduce until is rref is obtained
  }

  public printMatrix(mat: number[][]) {
    console.table(mat);
    const matComponent = this.stepsContainer.createComponent(this._matrixComponentFactory);
    matComponent.instance.matrix = JSON.parse(JSON.stringify(mat)); // didn't have time to deep-copy the right way
    matComponent.instance.heightClass = 'h-8';
  }

  public printSwapOp(op: EOpSwap) {
    console.log("Swap", op);
    if (!this._mat)
      return;

    const opsComponent = this.stepsContainer.createComponent(this._operationsComponentFactory);
    const ops: EOpSwap[] = Array(this._mat.length);
    for (let i = 0; i < this._mat.length; ++i)
      if (op.Ri === i)
        ops[i] = op;

    opsComponent.instance.ops = ops; // didn't have time to deep-copy the right way
    opsComponent.instance.heightClass = 'h-8';
  }

  public printMultOp(op: EOpMult) {
    console.log("Mult", op);

    if (!this._mat)
      return;

    const opsComponent = this.stepsContainer.createComponent(this._operationsComponentFactory);
    const ops: EOpSwap[] = Array(this._mat.length);
    for (let i = 0; i < this._mat.length; ++i)
      if (op.Ri === i)
        ops[i] = op;

    opsComponent.instance.ops = ops; // didn't have time to deep-copy the right way
    opsComponent.instance.heightClass = 'h-8';
  }

  public printMultSumOps(ops: EOpMultSum[]) {
    console.log("Mult sum", ops);

    const opsComponent = this.stepsContainer.createComponent(this._operationsComponentFactory);

    opsComponent.instance.ops = ops; // didn't have time to deep-copy the right way
    opsComponent.instance.heightClass = 'h-8';
  }
}
