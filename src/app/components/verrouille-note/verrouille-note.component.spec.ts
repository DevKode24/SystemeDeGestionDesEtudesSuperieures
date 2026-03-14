import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerrouilleNoteComponent } from './verrouille-note.component';

describe('VerrouilleNoteComponent', () => {
  let component: VerrouilleNoteComponent;
  let fixture: ComponentFixture<VerrouilleNoteComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VerrouilleNoteComponent]
    });
    fixture = TestBed.createComponent(VerrouilleNoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
