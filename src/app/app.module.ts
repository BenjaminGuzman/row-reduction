import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatrixInputComponent} from './matrix-input/matrix-input.component';
import {MatGridListModule} from "@angular/material/grid-list";
import {MatrixRowInputComponent} from './matrix-row-input/matrix-row-input.component';
import {ReactiveFormsModule} from "@angular/forms";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {MatSnackBarModule} from "@angular/material/snack-bar";
import {MatrixComponent} from './matrix/matrix.component';
import {OperationsComponent} from './operations/operations.component';
import {MatProgressBarModule} from "@angular/material/progress-bar";


@NgModule({
  declarations: [
    AppComponent,
    MatrixInputComponent,
    MatrixRowInputComponent,
    MatrixComponent,
    OperationsComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatGridListModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressBarModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
