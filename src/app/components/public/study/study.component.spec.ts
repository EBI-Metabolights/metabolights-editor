import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicStudyComponent } from './study.component';

describe('StudyComponent', () => {
  let component: PublicStudyComponent;
  let fixture: ComponentFixture<PublicStudyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PublicStudyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PublicStudyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
