import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidationDetailComponent } from './validation-detail.component';

describe('ValidationDetailComponent', () => {
  let component: ValidationDetailComponent;
  let fixture: ComponentFixture<ValidationDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ValidationDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ValidationDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Curator View Tests', () => {

    it('should only show the override button on validation details that represent errors', () => {

    })

    it('should allow the curator to enter a comment', () => {

    })

    it('pressing the save button should make a request to the service to save the comment', () => {

    })
  })

  describe('User View Tests', () => {

  })
});
