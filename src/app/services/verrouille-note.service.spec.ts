import { TestBed } from '@angular/core/testing';

import { VerrouilleNoteService } from './verrouille-note.service';

describe('VerrouilleNoteService', () => {
  let service: VerrouilleNoteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VerrouilleNoteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
