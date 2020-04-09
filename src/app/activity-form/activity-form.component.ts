import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { ActivityType, CTOffices, NewUserLog } from './activity';
import { ActivityService } from '../services/activity.service';

@Component({
  selector: 'app-activity-form',
  templateUrl: './activity-form.component.html',
  styleUrls: ['./activity-form.component.scss']
})
export class ActivityFormComponent implements OnInit {

  activityInputForm: FormGroup;
  activities: FormArray;
  capTechOffices: string[] = [];
  filteredOffices: Observable<string[]>;

  constructor(private fb: FormBuilder,
              private activityService: ActivityService) {
    Object.values(CTOffices).filter(value => this.capTechOffices.push(value));
  }

  ngOnInit(): void {
    this.activityInputForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      office: ['', Validators.required],
      activities: this.fb.array([this.createActivityItem()])
    });

    this.filteredOffices = this.activityInputForm.get('office').valueChanges
      .pipe(
        startWith(''),
        map(value => this._filter(value))
      );

    this.activities = this.activityInputForm.get('activities') as FormArray;
  }

  addActivity(): void {
    this.activities.push(this.createActivityItem());
  }

  removeActivity(index: number): void {
    if (this.activities.length > 1) {
      this.activities.removeAt(index);
    } else {
      this.activities.at(index).get('distance').setValue('');
      this.activities.at(index).get('activityType').setValue('');
      this.activities.at(index).get('date').setValue(new Date());
    }
  }

  createActivityItem(): FormGroup {
    return this.fb.group({
      distance: ['', Validators.required],
      activityType: ['', Validators.required],
      date: [new Date(), Validators.required]
    });
  }

  onSubmit(): void {
    if (this.activityInputForm.valid) {
      const payload: NewUserLog = this.activityInputForm.getRawValue();
      payload.activities.forEach(activity => {
        switch (activity.activityType) {
          case ActivityType.BIKE:
            payload.totalBikeMiles = (payload.totalBikeMiles || 0) + activity.distance;
            break;
          case ActivityType.RUN:
            payload.totalRunMiles = (payload.totalRunMiles || 0) + activity.distance;
            break;
          case ActivityType.WALK:
            payload.totalWalkMiles = (payload.totalWalkMiles || 0) + activity.distance;
            break;
        }
      });

      this.activityService.addActivity(payload).then(() => {
        this.activities.clear();
        this.addActivity();
      });
    }
  }

  private _filter(value: string): string[] {
    return this.capTechOffices.filter(option => option.toLowerCase().includes(value.toLowerCase()));
  }
}
