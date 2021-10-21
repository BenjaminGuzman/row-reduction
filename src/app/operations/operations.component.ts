import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnInit,
  Renderer2,
  ViewChild
} from '@angular/core';
import {EOp} from "../operations";
import {render} from "katex";

@Component({
  selector: 'app-operations',
  templateUrl: './operations.component.html',
  styleUrls: ['./operations.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OperationsComponent implements OnInit, AfterViewInit {
  /**
   * Height class to apply to each row in the operations list
   */
  @Input()
  public heightClass: string = '';

  @Input()
  public ops: EOp[] = [];

  @ViewChild('opsContainer')
  public opsContainer: ElementRef = undefined as unknown as ElementRef;

  constructor(private _renderer: Renderer2) { }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    // console.log('...');
    for (const op of this.ops)
      this.renderOp(op);
  }

  renderOp(op?: EOp): void {
    // console.log(op);
    const emptyEl = this._renderer.createElement('div');
    this._renderer.addClass(emptyEl, this.heightClass);
    this._renderer.appendChild(this.opsContainer.nativeElement, emptyEl);

    if (!op) {
      // if there is no operation, just leave the empty space
      // to give the sensation that row operations are aligned with rows in matrix
      return;
    }

    switch (op.name) {
      case "Mult":
        return render(`${op.factor.toLatex()}\\ R_{${op.Ri + 1}}\\ \\rightarrow R_{${op.Ri + 1}}`, emptyEl);
      case "MultSum":
        const operator = op.factor.compare(0) < 0 ? '+' : '-';
        const factor = op.factor.equals(1) ? '' : op.factor.abs().toLatex();
        return render(`R_{${op.Rj + 1}}\\ ${operator}\\ ${factor}\\ R_{${op.Ri + 1}}\\ \\rightarrow\\ R_{${op.Rj + 1}}`, emptyEl);
      case "Swap":
        return render(`R_{${op.Ri + 1}}\\ \\leftrightarrow\\ R_{${op.Rj + 1}}`, emptyEl);
    }
  }
}
