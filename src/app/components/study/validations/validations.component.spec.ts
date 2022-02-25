import { Directive, EventEmitter, Input, Output } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { failedValidation } from 'src/app/models/mtbl/mtbls/mocks/mock-validation';
import { ValidationDetail } from './validation-detail/validation-detail.component';

import { ValidationsComponent } from './validations.component';

@Directive({
  selector: 'app-validation-detail'
})
export class MockValidationDetailComponent {
  @Input() isCurator: boolean;
  @Input() validationDetail: ValidationDetail
  @Output() commentSaved: EventEmitter<{comment: string}> = new EventEmitter();
}

describe('ValidationsComponent', () => {
  let component: ValidationsComponent;
  let fixture: ComponentFixture<ValidationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ 
        ValidationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ValidationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the validation description if one is present in the event of validation error.', () => {
    component.validation = failedValidation;
    fixture.detectChanges();

    const failureElement = fixture.debugElement.query(By.css('#error')).nativeElement;
    expect(failureElement).toBeTruthy();
    expect(failureElement.innerHtml).toBe('Make sure there are some descriptors.');
  })



});
