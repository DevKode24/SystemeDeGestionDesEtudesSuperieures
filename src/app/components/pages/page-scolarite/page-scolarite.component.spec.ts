import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageScolariteComponent } from './page-scolarite.component';

describe('PageScolariteComponent', () => {
  let component: PageScolariteComponent;
  let fixture: ComponentFixture<PageScolariteComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PageScolariteComponent]
    });
    fixture = TestBed.createComponent(PageScolariteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
