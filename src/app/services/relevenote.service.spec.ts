import { TestBed } from '@angular/core/testing';

import { RelevenoteService } from './relevenote.service';

describe('RelevenoteService', () => {
  let service: RelevenoteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RelevenoteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
