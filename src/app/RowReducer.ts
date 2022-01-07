import {EOpMult, EOpMultSum, EOpSwap} from "./operations";
import Fraction from "fraction.js";

export class RowReducer {
  /**
   * Input matrix
   *
   * Its contents will be overwritten as the program tries to reduce this matrix
   */
  private readonly _mat: Fraction[][];

  /**
   * Array of the same length as {@link _mat}
   *
   * Number of operations in one step should be at most the number of rows in the input matrix
   */
  private _ops: EOpMultSum[];

  /**
   * Just a cache for {@link _mat#length}
   */
  private readonly _nRows: number;

  /**
   * Just a cache for the number of columns, ie {@code _inMat[0]#length}
   */
  private readonly _nCols: number;

  /**
   *
   * @param inMat the input matrix
   * @param printMat callback to be invoked each time the matrix changed
   * @param printSwapOp callback to be invoked each time swap operation was performed
   * @param printMultOp callback to be invoked each time multiplication operation was performed
   * @param printMultSumOps callback to be invoked each time multiplication and sum operation was performed
   */
  constructor(
    inMat: Fraction[][],
    private readonly printMat: (mat: Fraction[][]) => void,
    private readonly printSwapOp: (op: EOpSwap) => void,
    private readonly printMultOp: (op: EOpMult) => void,
    private readonly printMultSumOps: (ops: EOpMultSum[]) => void,
  ) {
    this._mat = inMat;

    this._nRows = inMat.length;
    this._nCols = inMat[0].length;

    this._ops = [];
  }

  /**
   * Reduce the matrix
   *
   * @param rref if true, reduction will leave the matrix in reduced row echelon form (Gauss-Jordan).
   *             If false, the matrix will be in upper triangular form only
   */
  public reduce(rref: boolean = true): void {
    let cols2Reduce = Math.min(this._nRows, this._nCols);

    for (let pivotCol = 0; pivotCol < cols2Reduce; ++pivotCol) { // O(n)
      let pivotRow = this.selectPivotRow(pivotCol);
      if (pivotRow === this._nRows) // all values in column are 0, so it is already reduced
        continue;

      // swap the pivot
      if (pivotRow !== pivotCol) {
        const tmp = this._mat[pivotRow];
        this._mat[pivotRow] = this._mat[pivotCol];
        this._mat[pivotCol] = tmp;

        this.printSwapOp({
          Ri: pivotCol,
          Rj: pivotRow,
          name: "Swap"
        })
        this.printMat(this._mat);

        pivotRow = pivotCol;
      }

      // make the pivot equal 1
      if (!this._mat[pivotRow][pivotCol].equals(1)) {
        const pivot: Fraction = this._mat[pivotRow][pivotCol];

        // values above the pivotCol (but in the same row) should already be 0
        for (let j = pivotCol; j < this._nCols; ++j)
          this._mat[pivotRow][j] = this._mat[pivotRow][j].div(pivot);

        this.printMultOp({
          Ri: pivotRow,
          factor: new Fraction(1).div(pivot),
          name: "Mult"
        });
        this.printMat(this._mat);
      }

      // reduce elements above the pivot
      if (rref)
        this.rowReduce(0, pivotRow, pivotCol);

      // reduce elements below the pivot
      this.rowReduce(pivotRow + 1, this._nRows, pivotCol);
      this.printMultSumOps(this.ops);
      this.printMat(this._mat);
      this._ops = [];
    }
  }

  get mat(): Fraction[][] {
    return this._mat;
  }

  get ops(): EOpMultSum[] {
    return this._ops;
  }

  /**
   * Get the row index of the element with the greatest absolute value in the given colum
   *
   * @param col the column index
   * @return the row index, or {@link _nRows} if all values in column are 0
   */
  private selectPivotRow(col: number): number {
    let row = 0;
    let max: Fraction | number = 0;
    for (let i = col; i < this._nRows; ++i)
      if (this._mat[i][col].abs().compare(max) > 0) {
        max = this._mat[i][col];
        row = i;
      }

    if (max === 0) // all elements are zero
      return this._nRows;

    return row;
  }

  /**
   * Row reduce rows between start (inclusive) and end (exclusive)
   * @param start first row to reduce
   * @param end last row to reduce
   * @param pivotCol pivot column index.
   *  The pivot should already be swapped and divided its row by the pivot value
   *  so accessing the value at this row and column (pivotCol is also the pivot row) should
   *  return the pivot and should equal 1
   */
  private rowReduce(start: number, end: number, pivotCol: number): void {
    // const pivot: Fraction = this._mat[pivotCol][pivotCol]; // yes this array access is right, check other comments
    for (let i = start; i < end; ++i) {
      const factor: Fraction = this._mat[i][pivotCol];
      if (factor.equals(0))
        continue;

      for (let j = pivotCol; j < this._nCols; ++j) {
        this._mat[i][j] = this._mat[i][j].sub(factor.mul(this._mat[pivotCol][j]));
        this._ops[i] = {
          Ri: pivotCol,
          Rj: i,
          factor: factor,
          name: "MultSum"
        }
      }
    }
  }
}
