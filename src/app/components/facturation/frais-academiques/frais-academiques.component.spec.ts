import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FraisAcademiquesComponent } from './frais-academiques.component';

describe('FraisAcademiquesComponent', () => {
  let component: FraisAcademiquesComponent;
  let fixture: ComponentFixture<FraisAcademiquesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FraisAcademiquesComponent]
    });
    fixture = TestBed.createComponent(FraisAcademiquesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
