import { TestBed } from '@angular/core/testing';

import { FraisAcademiquesService } from './frais-academiques.service';

describe('FraisAcademiquesService', () => {
  let service: FraisAcademiquesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FraisAcademiquesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
