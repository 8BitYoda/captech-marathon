import { TestBed } from '@angular/core/testing';

import { SelectedOfficeActivityService } from './selected-office-activity.service';

describe('SelectedOfficeActivityService', () => {
  let service: SelectedOfficeActivityService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SelectedOfficeActivityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
