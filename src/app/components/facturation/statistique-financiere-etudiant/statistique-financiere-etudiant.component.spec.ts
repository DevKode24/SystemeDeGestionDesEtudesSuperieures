import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatistiqueFinanciereEtudiantComponent } from './statistique-financiere-etudiant.component';

describe('StatistiqueFinanciereEtudiantComponent', () => {
  let component: StatistiqueFinanciereEtudiantComponent;
  let fixture: ComponentFixture<StatistiqueFinanciereEtudiantComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StatistiqueFinanciereEtudiantComponent]
    });
    fixture = TestBed.createComponent(StatistiqueFinanciereEtudiantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
