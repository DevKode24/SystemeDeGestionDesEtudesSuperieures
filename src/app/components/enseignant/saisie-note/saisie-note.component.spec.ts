import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaisieNoteComponent } from './saisie-note.component';

describe('SaisieNoteComponent', () => {
  let component: SaisieNoteComponent;
  let fixture: ComponentFixture<SaisieNoteComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SaisieNoteComponent]
    });
    fixture = TestBed.createComponent(SaisieNoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
