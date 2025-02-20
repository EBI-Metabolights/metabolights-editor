import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudyNotPublicComponent } from './study-not-public.component';

describe('StudyNotPublicComponent', () => {
  let component: StudyNotPublicComponent;
  let fixture: ComponentFixture<StudyNotPublicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudyNotPublicComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudyNotPublicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
