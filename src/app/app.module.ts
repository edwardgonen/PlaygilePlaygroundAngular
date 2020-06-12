import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { UserstoryassessmentComponent } from './userstoryassessment/userstoryassessment.component';
import { BacklogassessmentComponent } from './backlogassessment/backlogassessment.component';
import { ProgressmonitorComponent } from './progressmonitor/progressmonitor.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; // <-- NgModel lives here
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatSliderModule } from '@angular/material/slider';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatGridListModule } from '@angular/material/grid-list'
import { MatDividerModule } from '@angular/material/divider'
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { Ng2GoogleChartsModule, GoogleChartsSettings } from 'ng2-google-charts';
import { MatDialogModule } from "@angular/material/dialog";

import { ConfirmationDialog } from './shared/confirm-dialog/confirm-dialog.component';
import { AlertDialogComponent } from './shared/alert-dialog/alert-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    UserstoryassessmentComponent,
    BacklogassessmentComponent,
    ProgressmonitorComponent,
    ConfirmationDialog, AlertDialogComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    MatSliderModule,
    MatSelectModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatGridListModule,
    MatDividerModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatTabsModule,
    MatDialogModule,
    Ng2GoogleChartsModule
  ],
  entryComponents: [ConfirmationDialog, AlertDialogComponent],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
