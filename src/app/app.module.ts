import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivityFormComponent } from './activity-form/activity-form.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ActivityService } from './services/activity.service';
import { AngularFireModule } from '@angular/fire';
import { environment } from '../environments/environment';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetModule, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TotalsComponent } from './totals/totals.component';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { NgxMapboxGLModule } from 'ngx-mapbox-gl';
import { MapComponent } from './map/map.component';
import { MockActivityService } from './services/mock/mock-activity.service';

@NgModule({
  declarations: [
    AppComponent,
    ActivityFormComponent,
    TotalsComponent,
    MapComponent
  ],
  imports: [
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFirestoreModule,
    BrowserModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatInputModule,
    MatNativeDateModule,
    MatDatepickerModule,
    MatButtonToggleModule,
    MatIconModule,
    MatButtonModule,
    MatBottomSheetModule,
    MatTooltipModule,
    MatSelectModule,
    MatDividerModule,
    NgxMapboxGLModule.withConfig({
      accessToken: 'pk.eyJ1IjoiamF5ZmlhbGtvd3NraSIsImEiOiJjazhyamMxOTUwMHAzM2dxbXVoMXR1bTh3In0.V0d8Dnpa3jNycNpIPEtuYQ'
    })
  ],
  providers: [
    // ActivityService,
    {provide: MatBottomSheetRef, useValue: {}},
    {provide: MAT_BOTTOM_SHEET_DATA, useValue: {}},
    {provide: ActivityService, useClass: MockActivityService}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
