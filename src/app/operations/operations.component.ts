import {Component, Input, OnInit} from '@angular/core';
import {EOp} from "../operations";
import {renderToString} from "katex";
import {DecimalPipe} from "@angular/common";

@Component({
  selector: 'app-operations',
  templateUrl: './operations.component.html',
  styleUrls: ['./operations.component.css']
})
export class OperationsComponent implements OnInit {
  /**
   * Height class to apply to each row in the operations list
   */
  @Input()
  public heightClass: string = '';

  @Input()
  public ops: EOp[] = [];

  constructor(private _decPipe: DecimalPipe) { }

  ngOnInit(): void {
  }

  renderOp(op?: EOp): string {
    if (!op)
      return '';

    switch (op.name) {
      case "Mult":
        return renderToString(`${this._decPipe.transform(op.factor, '1.0-4')}\\ \\cdot R${op.Ri + 1}\\ \\rightarrow R${op.Ri + 1}`);
      case "MultSum":
        return renderToString(`R${op.Rj + 1}\\ ${op.factor < 0 ? '+' : '-'}\\ ${this._decPipe.transform(Math.abs(op.factor), '1.0-4')}\\ \\cdot R${op.Ri + 1}\\ \\rightarrow\\ R${op.Rj + 1}`);
      case "Swap":
        return renderToString(`R${op.Ri + 1}\\ \\leftrightarrow\\ R${op.Rj + 1}`);
      default:
        return '';
    }
  }
}
