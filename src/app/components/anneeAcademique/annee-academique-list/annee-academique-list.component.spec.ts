import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnneeAcademiqueComponent } from './annee-academique-list.component';

describe('AnneeAcademiqueListComponent', () => {
  let component: AnneeAcademiqueComponent;
  let fixture: ComponentFixture<AnneeAcademiqueComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AnneeAcademiqueComponent]
    });
    fixture = TestBed.createComponent(AnneeAcademiqueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
