import Fraction from "fraction.js";

type EOpNames = 'Swap' | 'Mult' | 'MultSum';
interface AbstractEOp {
  name: EOpNames;
  Ri: number;
  Rj: number;
}

interface AbstractEOpWFactor {
  factor: Fraction;
}

/**
 * Elemental operation: Row swap. Ri <-> Rj
 */
export interface EOpSwap extends AbstractEOp {
}

/**
 * Elemental operation: Multiply by a scalar. c(Ri) -> Ri
 */
export interface EOpMult extends AbstractEOpWFactor {
  name: EOpNames;
  Ri: number;
}

/**
 * Elemental operation: Sum Ri multiplied by c with Rj and place it in Rj. c(Ri) + Rj -> Rj
 */
export interface EOpMultSum extends AbstractEOp/*, AbstractEOpWFactor*/ {
  factor: Fraction;
}

export type EOp = EOpSwap | EOpMult | EOpMultSum;
