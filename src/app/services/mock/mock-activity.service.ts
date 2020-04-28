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
    totalMiles: 987654,
    totalBike: 87654,
    totalRun: 7654,
    totalWalk: 6543
  };

  addActivity(payload: NewUserLog) {
    return true;
  }

  getTotalMiles(office?: CTOffices) {
    return of(this.mockTotals);
  }
}
