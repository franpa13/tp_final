import { TestBed } from '@angular/core/testing';

import { ServiceProfile } from './service.profile';

describe('ServiceProfile', () => {
  let service: ServiceProfile;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServiceProfile);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
