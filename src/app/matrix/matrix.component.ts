import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-matrix',
  templateUrl: './matrix.component.html',
  styleUrls: ['./matrix.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MatrixComponent implements OnInit {
  /**
   * Height class to apply to each row in the matrix
   */
  @Input()
  public heightClass: string = '';

  /**
   * Matrix to be printed
   */
  @Input()
  public matrix: number[][] = [];

  constructor() { }

  ngOnInit(): void {
  }

}
