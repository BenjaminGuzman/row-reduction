import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatrixRowInputComponent } from './matrix-row-input.component';

describe('MatrixRowInputComponent', () => {
  let component: MatrixRowInputComponent;
  let fixture: ComponentFixture<MatrixRowInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MatrixRowInputComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MatrixRowInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
