import { Injectable } from '@angular/core';
import { ActivityServiceInterface } from '../activity.service';
import { Totals } from '../../models/totals';
import { CTOffices, NewUserLog } from '../../models/activity';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MockActivityService implements ActivityServiceInterface {
  private mockTotals: Totals = {
    totalMiles: 3185,
    totalBike: 1650,
    totalRun: 930,
    totalWalk: 605
  };

  addActivity(payload: NewUserLog) {
    return true;
  }

  getTotalMiles(office?: CTOffices) {
    return of(this.mockTotals);
  }
}
