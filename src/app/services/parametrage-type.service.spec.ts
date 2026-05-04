import { TestBed } from '@angular/core/testing';

import { ParametrageTypeService } from './parametrage-type.service';

describe('ParametrageTypeService', () => {
  let service: ParametrageTypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ParametrageTypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
