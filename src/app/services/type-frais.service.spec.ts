import { TestBed } from '@angular/core/testing';

import { TypeFraisService } from './type-frais.service';

describe('TypeFraisService', () => {
  let service: TypeFraisService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TypeFraisService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
