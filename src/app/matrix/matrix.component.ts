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
import Fraction from "fraction.js";
import {render, renderToString} from "katex";

@Component({
  selector: 'app-matrix',
  templateUrl: './matrix.component.html',
  styleUrls: ['./matrix.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MatrixComponent implements OnInit, AfterViewInit {
  /**
   * Matrix to be printed
   */
  @Input()
  public matrix: Fraction[][] = [];

  @ViewChild('rowsContainer')
  public rowsContainer: ElementRef = undefined as unknown as ElementRef;

  constructor(private _renderer: Renderer2) { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    const nCols = this.matrix[0].length;

    this._renderer.setStyle(this.rowsContainer.nativeElement, 'grid-template-columns', `repeat(${nCols}, 1fr)`);

    for (const row of this.matrix) {
      for (const element of row) {
        // create element container
        const elContainer = this._renderer.createElement('div');
        this._renderer.addClass(elContainer, 'w-min');
        this._renderer.addClass(elContainer, 'whitespace-nowrap');
        this._renderer.appendChild(this.rowsContainer.nativeElement, elContainer);
        render(element.toLatex(), elContainer);
      }
    }
  }
}
