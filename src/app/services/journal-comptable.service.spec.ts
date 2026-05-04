import { TestBed } from '@angular/core/testing';

import { JournalComptableService } from './journal-comptable.service';

describe('JournalComptableService', () => {
  let service: JournalComptableService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JournalComptableService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
