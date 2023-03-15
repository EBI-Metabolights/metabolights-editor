import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NoStudyPageComponent } from './no-study-page.component';

describe('NoStudyPageComponent', () => {
  let component: NoStudyPageComponent;
  let fixture: ComponentFixture<NoStudyPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NoStudyPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NoStudyPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
