import { Component, OnInit } from '@angular/core';
import { ActivityType, CTOffices } from '../models/activity';
import { ActivityService } from '../services/activity.service';
import { Totals } from '../models/totals';
import { SelectedOfficeActivityService } from '../services/selected-office-activity.service';

@Component({
  selector: 'app-totals',
  templateUrl: './totals.component.html',
  styleUrls: ['./totals.component.scss']
})
export class TotalsComponent implements OnInit {
  totals: Totals;
  capTechOffices: string[] = ['All'];

  constructor(private activityService: ActivityService,
              private selectedOfficeActivityService: SelectedOfficeActivityService) {
    Object.values(CTOffices).filter(value => this.capTechOffices.push(value));
  }

  ngOnInit(): void {
    this.getTotalMiles();
  }

  refreshTotals(office): void {
    this.selectedOfficeActivityService.updateSelection(CTOffices[office.value.toUpperCase()], ActivityType.ALL);
    this.getTotalMiles(office.value.toUpperCase() === 'ALL' ? null : CTOffices[office.value.toUpperCase()]);
  }

  private getTotalMiles(office?: CTOffices) {
    this.activityService.getTotalMiles(office).subscribe(res => {
      this.totals = res;
    }, error => {
      console.error(error);
    });
  }
}
