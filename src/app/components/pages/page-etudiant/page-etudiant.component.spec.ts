import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageEtudiantComponent } from './page-etudiant.component';

describe('PageEtudiantComponent', () => {
  let component: PageEtudiantComponent;
  let fixture: ComponentFixture<PageEtudiantComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PageEtudiantComponent]
    });
    fixture = TestBed.createComponent(PageEtudiantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
