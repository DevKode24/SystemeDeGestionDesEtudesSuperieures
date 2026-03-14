import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoEtudiantComponent } from './info-etudiant.component';

describe('InfoEtudiantComponent', () => {
  let component: InfoEtudiantComponent;
  let fixture: ComponentFixture<InfoEtudiantComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InfoEtudiantComponent]
    });
    fixture = TestBed.createComponent(InfoEtudiantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
