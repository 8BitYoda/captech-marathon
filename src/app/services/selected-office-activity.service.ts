import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { SelectedOfficeActivity } from '../models/selectedOfficeActivity';
import { ActivityType, CTOffices } from '../models/activity';

@Injectable({
  providedIn: 'root'
})
export class SelectedOfficeActivityService {
  private currentSelections: Subject<SelectedOfficeActivity> = new Subject<SelectedOfficeActivity>();

  updateSelection(officeSelection: CTOffices, selectedActivityType: ActivityType) {
    this.currentSelections.next({office: officeSelection, activityType: selectedActivityType});
  }

  getCurrentSelections(): Observable<SelectedOfficeActivity> {
    return this.currentSelections.asObservable();
  }
}
