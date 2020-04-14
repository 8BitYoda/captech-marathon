import { Component, OnInit } from '@angular/core';
import { CTOffices } from '../models/activity';
import { ActivityService } from '../services/activity.service';
import { Totals } from '../models/totals';

@Component({
  selector: 'app-totals',
  templateUrl: './totals.component.html',
  styleUrls: ['./totals.component.scss']
})
export class TotalsComponent implements OnInit {
  totals: Totals;
  capTechOffices: string[] = ['All'];

  constructor(private activityService: ActivityService) {
    Object.values(CTOffices).filter(value => this.capTechOffices.push(value));
  }

  ngOnInit(): void {
    this.getTotalMiles();
  }

  refreshTotals(office): void {
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
