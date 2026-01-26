import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RelevenoteComponent } from './relevenote.component';

describe('RelevenoteComponent', () => {
  let component: RelevenoteComponent;
  let fixture: ComponentFixture<RelevenoteComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RelevenoteComponent]
    });
    fixture = TestBed.createComponent(RelevenoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
