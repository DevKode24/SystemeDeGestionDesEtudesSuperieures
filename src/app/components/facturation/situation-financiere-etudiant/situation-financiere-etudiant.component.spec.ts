import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SituationFinanciereEtudiantComponent } from './situation-financiere-etudiant.component';

describe('SituationFinanciereEtudiantComponent', () => {
  let component: SituationFinanciereEtudiantComponent;
  let fixture: ComponentFixture<SituationFinanciereEtudiantComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SituationFinanciereEtudiantComponent]
    });
    fixture = TestBed.createComponent(SituationFinanciereEtudiantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
