import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidationDetailCommentComponent } from './validation-detail-comment.component';

describe('ValidationDetailCommentComponent', () => {
  let component: ValidationDetailCommentComponent;
  let fixture: ComponentFixture<ValidationDetailCommentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ValidationDetailCommentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ValidationDetailCommentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
