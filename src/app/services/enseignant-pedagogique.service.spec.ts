import { TestBed } from '@angular/core/testing';

import { EnseignantPedagogiqueService } from './enseignant-pedagogique.service';

describe('EnseignantPedagogiqueService', () => {
  let service: EnseignantPedagogiqueService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EnseignantPedagogiqueService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
