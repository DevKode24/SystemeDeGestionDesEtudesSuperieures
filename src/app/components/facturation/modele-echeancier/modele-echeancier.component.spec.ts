import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModeleEcheancierComponent } from './modele-echeancier.component';

describe('ModeleEcheancierComponent', () => {
  let component: ModeleEcheancierComponent;
  let fixture: ComponentFixture<ModeleEcheancierComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ModeleEcheancierComponent]
    });
    fixture = TestBed.createComponent(ModeleEcheancierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
