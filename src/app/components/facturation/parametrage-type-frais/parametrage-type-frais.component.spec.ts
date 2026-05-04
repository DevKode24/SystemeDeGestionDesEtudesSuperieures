import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParametrageTypeFraisComponent } from './parametrage-type-frais.component';

describe('ParametrageTypeFraisComponent', () => {
  let component: ParametrageTypeFraisComponent;
  let fixture: ComponentFixture<ParametrageTypeFraisComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ParametrageTypeFraisComponent]
    });
    fixture = TestBed.createComponent(ParametrageTypeFraisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
