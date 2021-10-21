import Fraction from "fraction.js";

type EOpNames = 'Swap' | 'Mult' | 'MultSum';
interface AbstractEOp {
  name: EOpNames;
  Ri: number;
  Rj: number;
  factor: Fraction;
}

/**
 * Elemental operation: Row swap. Rj <-> Ri
 */
export interface EOpSwap extends AbstractEOp {
  /**
   * Index of row 1 to be swapped with row 2
   */
  Ri: number;

  /**
   * Index of row 2 to be swapped with row 3
   */
  Rj: number;
}

/**
 * Elemental operation: Multiply by a scalar. c(Ri) -> Ri
 */
export interface EOpMult extends AbstractEOp {
  /**
   * Index of the row to be multiplied by a scalar
   */
  Ri: number;

  /**
   * Multiplying factor for {@link Ri}. Must be different from 0
   */
  factor: Fraction;
}

/**
 * Elemental operation: Sum Ri with Rj and place it in Rj. c(Ri) + Rj -> Rj
 */
export interface EOpMultSum extends AbstractEOp {
  /**
   * Index of Ri
   *
   * Must be different from {@link Rj}
   */
  Ri: number;

  /**
   * Index of Rj
   *
   * Must be different from {@link Ri}
   */
  Rj: number;

  /**
   * Multiplying factor for {@link Ri}.
   */
  factor: Fraction;
}

export type EOp = EOpSwap | EOpMult | EOpMultSum;
