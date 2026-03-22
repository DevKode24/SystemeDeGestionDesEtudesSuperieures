import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FacturesEtudiantComponent } from './factures-etudiant.component';

describe('FacturesEtudiantComponent', () => {
  let component: FacturesEtudiantComponent;
  let fixture: ComponentFixture<FacturesEtudiantComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FacturesEtudiantComponent]
    });
    fixture = TestBed.createComponent(FacturesEtudiantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
