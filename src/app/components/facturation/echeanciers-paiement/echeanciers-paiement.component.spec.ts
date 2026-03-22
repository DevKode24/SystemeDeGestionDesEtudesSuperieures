import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EcheanciersPaiementComponent } from './echeanciers-paiement.component';

describe('EcheanciersPaiementComponent', () => {
  let component: EcheanciersPaiementComponent;
  let fixture: ComponentFixture<EcheanciersPaiementComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EcheanciersPaiementComponent]
    });
    fixture = TestBed.createComponent(EcheanciersPaiementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
