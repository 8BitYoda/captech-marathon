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
  currentOffice: CTOffices;
  selectedActivityType: ActivityType;
  selectedActivityTotal: number;

  constructor(private activityService: ActivityService,
              private selectedOfficeActivityService: SelectedOfficeActivityService) {
    Object.values(CTOffices).filter(value => this.capTechOffices.push(value));
  }

  ngOnInit(): void {
    this.getTotalMiles();
  }

  refreshTotals(office): void {
    this.currentOffice = CTOffices[office.value.toUpperCase()];
    this.selectedActivityType = ActivityType.ALL;
    this.selectedOfficeActivityService.updateSelection(this.currentOffice, this.selectedActivityType);
    this.getTotalMiles(office.value.toUpperCase() === 'ALL' ? null : CTOffices[office.value.toUpperCase()]);
  }

  updateSelectedActivityType(type): void {
    this.selectedActivityType = ActivityType[type.value.toUpperCase()];
    switch (this.selectedActivityType) {
      case ActivityType.BIKE:
        this.selectedActivityTotal = this.totals.totalBike;
        break;
      case ActivityType.RUN:
        this.selectedActivityTotal = this.totals.totalRun;
        break;
      case ActivityType.WALK:
        this.selectedActivityTotal = this.totals.totalWalk;
        break;
      default:
        this.selectedActivityTotal = this.totals.totalMiles;
    }
    this.selectedOfficeActivityService.updateSelection(this.currentOffice, this.selectedActivityType);
  }

  private getTotalMiles(office?: CTOffices) {
    this.activityService.getTotalMiles(office).subscribe(res => {
      this.totals = res;
      this.selectedActivityTotal = res.totalMiles;
    }, error => {
      console.error(error);
    });
  }
}
