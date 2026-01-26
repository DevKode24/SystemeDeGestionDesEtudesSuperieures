import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnneeAcademiqueUpdateComponent } from './annee-academique-update.component';

describe('AnneeAcademiqueUpdateComponent', () => {
  let component: AnneeAcademiqueUpdateComponent;
  let fixture: ComponentFixture<AnneeAcademiqueUpdateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AnneeAcademiqueUpdateComponent]
    });
    fixture = TestBed.createComponent(AnneeAcademiqueUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
