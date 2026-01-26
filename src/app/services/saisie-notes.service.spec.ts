import { TestBed } from '@angular/core/testing';

import { SaisieNotesService } from './saisie-notes.service';

describe('SaisieNotesService', () => {
  let service: SaisieNotesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SaisieNotesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
