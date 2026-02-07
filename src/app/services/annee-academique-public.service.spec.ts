import { TestBed } from '@angular/core/testing';

import { AnneeAcademiquePublicService } from './annee-academique-public.service';

describe('AnneeAcademiquePublicService', () => {
  let service: AnneeAcademiquePublicService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AnneeAcademiquePublicService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
