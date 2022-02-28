import { Directive, EventEmitter, Input, Output } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon/';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { failedValidation } from 'src/app/models/mtbl/mtbls/mocks/mock-validation';

import {  ValidationDetailComponent } from './validation-detail.component';

@Directive({
  selector: 'app-validation-detail-comment'
})
export class MockValidationDetailCommentComponent {
  @Input() curator: boolean;
  @Input() comment?: string;
  @Output() commentSaved: EventEmitter<{comment: string}> = new EventEmitter();
}


describe('ValidationDetailComponent', () => {
  let component: ValidationDetailComponent;
  let fixture: ComponentFixture<ValidationDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ValidationDetailComponent, MockValidationDetailCommentComponent ],
      imports: [BrowserAnimationsModule, MatIconModule, MatExpansionModule, MatDividerModule]

    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ValidationDetailComponent);
    component = fixture.componentInstance;
    component.validationDetail = failedValidation.validations[0].details[7]
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Curator View Tests', () => {

    beforeEach(() => {
      component.isCurator = true;
      component.validationDetail = failedValidation.validations[0].details[7]
      fixture.detectChanges();
    })

    it('should only show the override button on validation details that represent errors', () => {
      let spanElement = fixture.debugElement.query(By.css('.override'));
      expect(spanElement).toBeTruthy();

      component.validationDetail.status = 'warning'
      fixture.detectChanges();
      spanElement = fixture.debugElement.query(By.css('.override'))
      expect(spanElement).toBeNull();
      
    })


  })

  describe('User View Tests', () => {

    it('should render a description if one is present and the detail represents an error or warning', () => {
      let descriptionElement = fixture.debugElement.query(By.css('.val-description'));
      expect(descriptionElement).toBeTruthy();

      component.validationDetail.status = 'success';
      fixture.detectChanges();

      descriptionElement = fixture.debugElement.query(By.css('.val-description'));
      expect(descriptionElement).toBeNull();
    })

  })
});
