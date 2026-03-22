import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AjustementsEtudiantComponent } from './ajustements-etudiant.component';

describe('AjustementsEtudiantComponent', () => {
  let component: AjustementsEtudiantComponent;
  let fixture: ComponentFixture<AjustementsEtudiantComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AjustementsEtudiantComponent]
    });
    fixture = TestBed.createComponent(AjustementsEtudiantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
