import { TestBed } from '@angular/core/testing';

import { ModeleEcheancierService } from './modele-echeancier.service';

describe('ModeleEcheancierService', () => {
  let service: ModeleEcheancierService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ModeleEcheancierService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
