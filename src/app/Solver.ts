import {EOpMult, EOpMultSum, EOpSwap} from "./operations";

export class Solver {
  /**
   * Input matrix
   *
   * Its contents will be overwritten as the program tries to reduce this matrix
   */
  private readonly _mat: number[][];

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

  private firstRow: number = 0;

  /**
   *
   * @param inMat the input matrix
   * @param printMat callback to be invoked each time the matrix changed
   * @param printSwapOp callback to be invoked each time swap operation was performed
   * @param printMultOp callback to be invoked each time multiplication operation was performed
   * @param printMultSumOps callback to be invoked each time multiplication and sum operation was performed
   */
  constructor(
    inMat: number[][],
    private readonly printMat: (mat: number[][]) => void,
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
   * Reduce only the column of the first non-zero entry in the {@link mat}
   *
   * Call this until it returns false to completely reduce the matrix
   *
   * @return true if it can be reduced, false otherwise (no pivot could be selected)
   */
  public reduce(): boolean {
    // select the pivot row in O(nm)
    let minCountZeros: number = this._nCols; // this is the maximum amount of zeros that can be present in a row
    let pivotRow: number = -1;
    for (let i = this.firstRow, tmpZerosCount; i < this._nRows; ++i)
      if ((tmpZerosCount = this.countLZeros(i)) < minCountZeros) {
        pivotRow = i;
        minCountZeros = tmpZerosCount;
      }

    // all entries (except the last column) are 0 and therefore no pivot can be selected
    if (pivotRow === -1)
      return false;

    // swap first row and pivot row
    const tmp = this._mat[pivotRow];
    this._mat[pivotRow] = this._mat[this.firstRow];
    this._mat[this.firstRow] = tmp;
    // think about it, and you'll see doing this swap is actually like sorting the matrix by using selection sort
    if (pivotRow !== this.firstRow) {
      this.printSwapOp(<EOpSwap>{
        Ri: this.firstRow,
        Rj: pivotRow,
        name: "Swap"
      })
      this.printMat(this._mat);
    }

    // by now pivotRow should actually be firstRow
    let pivotCol: number = minCountZeros;
    let pivot: number = this._mat[this.firstRow][pivotCol];
    if (pivot !== 1) {
      for (let j = 0; j < this._nCols; ++j) // ensure the pivot is 1
        this._mat[this.firstRow][j] /= pivot;

      this.printMultOp(<EOpMult>{
        Ri: this.firstRow,
        factor: 1 / pivot,
        name: "Mult"
      });
      this.printMat(this._mat);
    }

    // reduce rows above the pivot in O(nm)
    this.rowReduce(0, this.firstRow, pivotCol);

    // reduce rows below the pivot in O(nm)
    this.rowReduce(this.firstRow + 1, this._nRows, pivotCol);

    this.printMultSumOps(this.ops);
    this.printMat(this._mat);

    // prepare values for the next call to reduce()
    ++this.firstRow;
    this._ops = [];

    return true;
  }

  get mat(): number[][] {
    return this._mat;
  }

  get ops(): EOpMultSum[] {
    return this._ops;
  }

  /**
   * Count the number of 0's from the left up to the first non-zero entry, excluding the last column
   *
   * This operation takes O(n) time
   *
   * The range of this function is between 0 and #cols
   *
   * @param idx row index
   */
  private countLZeros(idx: number): number {
    for (let nZeros = 0; nZeros < this._nCols; ++nZeros)
      if (this._mat[idx][nZeros] !== 0)
        return nZeros;

    return this._nCols;
  }

  /**
   * Row reduce rows between start (inclusive) and end (exclusive)
   * @param start first row to reduce
   * @param end last row to reduce
   * @param pivotCol index of the column of the pivot (it is already know the pivot is in the row index {@link firstRow})
   */
  private rowReduce(start: number, end: number, pivotCol: number): void {
    for (let i = start; i < end; ++i) { // for each row below the pivot
      const firstNonZeroInRow = this._mat[i][pivotCol];
      if (firstNonZeroInRow === 0) // there is no need to process this row since it already has a 0 in the pivotCol
        continue;

      // start from the pivot col and forward, since all values behind must be 0 by now
      for (let j = pivotCol; j < this._nCols; ++j) { // for each column in the row
        this._mat[i][j] -= firstNonZeroInRow * this._mat[this.firstRow][j];
        // think what would happen if j = pivotCol
        // this._outMat[i][pivotCol] = this._inMat[i][pivotCol] - firstNonZeroInRow * this._outMat[this.firstRow][pivotCol];
        // this._outMat[i][pivotCol] = this._inMat[i][pivotCol] - firstNonZeroInRow * 1;
        // this._outMat[i][pivotCol] = 0;

        this._ops[i] = {
          Ri: this.firstRow,
          Rj: i,
          factor: firstNonZeroInRow,
          name: "MultSum"
        }
      }
    }
  }
}
