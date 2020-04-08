import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { ActivityLog, CTOffices } from './activity';

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

  constructor(private fb: FormBuilder) {
    Object.keys(CTOffices).filter(key => this.capTechOffices.push(key));
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

  onSubmit() {
    if (this.activityInputForm.valid) {
      const payload: ActivityLog = this.activityInputForm.getRawValue();
      console.log('payload being submitted:', payload);
    }
  }

  private _filter(value: string): string[] {
    return this.capTechOffices.filter(option => option.toLowerCase().includes(value.toLowerCase()));
  }
}
