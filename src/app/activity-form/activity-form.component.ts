import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { ActivityType, CTOffices, NewUserLog } from './activity';
import { ActivityService } from '../services/activity.service';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';

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
              private activityService: ActivityService,
              private bottomSheetRef: MatBottomSheetRef<ActivityFormComponent>) {
    Object.values(CTOffices).filter(value => this.capTechOffices.push(value));
  }

  ngOnInit(): void {
    this.activityInputForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      office: ['', [Validators.required, OfficeValidator]],
      activities: this.fb.array([this.createActivityItem()])
    });

    this.filteredOffices = this.activityInputForm.get('office').valueChanges
      .pipe(
        startWith(''),
        map(value => this._filter(value))
      );

    this.activities = this.activityInputForm.get('activities') as FormArray;
  }

  createActivityItem(): FormGroup {
    return this.fb.group({
      distance: ['', [Validators.required, Validators.min(0)]],
      type: ['Run', Validators.required],
      date: [new Date(), Validators.required]
    });
  }

  addActivity(): void {
    this.activities.push(this.createActivityItem());
  }

  removeActivity(index: number): void {
    if (this.activities.length > 1) {
      this.activities.removeAt(index);
    } else {
      this.activities.at(index).get('distance').setValue('');
      this.activities.at(index).get('type').setValue('Run');
      this.activities.at(index).get('date').setValue(new Date());
    }
  }

  onSubmit(): void {
    if (this.activityInputForm.valid) {
      const payload: NewUserLog = this.activityInputForm.getRawValue();
      payload.activities.forEach(activity => {
        switch (activity.type) {
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

      this.bottomSheetRef.dismiss();
      // this.activityService.addActivity(payload).then(() => {
      //   this.activities.clear();
      //   this.addActivity();
      // });
    }
  }

  private _filter(value: string): string[] {
    return this.capTechOffices.filter(option => option?.toLowerCase().includes(value?.toLowerCase()));
  }
}

const OfficeValidator = (control: AbstractControl): { [key: string]: boolean } => {
  if (control.value && !Object.keys(CTOffices).includes(control.value.toString().toUpperCase())) {
    return {invalidOffice: true};
  }
  return null;
};
