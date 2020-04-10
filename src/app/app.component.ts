import { Component } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { ActivityFormComponent } from './activity-form/activity-form.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'captech-marathon';

  constructor(private bottomSheet: MatBottomSheet) {
  }

  openAddActionSheet(): void {
    this.bottomSheet.open(ActivityFormComponent);
  }

}
