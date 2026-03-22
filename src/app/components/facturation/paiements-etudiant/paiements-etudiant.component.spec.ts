import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaiementsEtudiantComponent } from './paiements-etudiant.component';

describe('PaiementsEtudiantComponent', () => {
  let component: PaiementsEtudiantComponent;
  let fixture: ComponentFixture<PaiementsEtudiantComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PaiementsEtudiantComponent]
    });
    fixture = TestBed.createComponent(PaiementsEtudiantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
