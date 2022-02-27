import { Directive, EventEmitter, Input, Output } from '@angular/core';
import { NgRedux } from '@angular-redux/store';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { failedValidation } from 'src/app/models/mtbl/mtbls/mocks/mock-validation';
import { ValidationDetail } from './validation-detail/validation-detail.component';

import { ValidationsComponent } from './validations.component';
import { EditorService } from 'src/app/services/editor.service';
import { MockEditorService } from 'src/app/services/editor.service.mock';


@Directive({
  selector: 'app-validation-detail'
})
export class MockValidationDetailComponent {
  @Input() isCurator: boolean;
  @Input() validationDetail: ValidationDetail
  @Output() commentSaved: EventEmitter<{comment: string}> = new EventEmitter();
}



fdescribe('ValidationsComponent', () => {
  let component: ValidationsComponent;
  let fixture: ComponentFixture<ValidationsComponent>;
  let editorService: EditorService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ValidationsComponent, MockValidationDetailComponent ],
      imports: [RouterTestingModule, HttpClientTestingModule],
      providers: [{provide: EditorService, useClass: MockEditorService}, NgRedux]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    editorService = TestBed.inject(EditorService)
    fixture = TestBed.createComponent(ValidationsComponent);
    component = fixture.componentInstance;
    spyOn(component, 'setUpSubscriptions').and.stub();

    component.studyValidation = failedValidation;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the correct number of validation detail components based on the config option', () => {
    component.displayOption = 'error';
    fixture.detectChanges();
    let detailList = fixture.debugElement.queryAll(By.directive(MockValidationDetailComponent));
    expect(detailList.length).toBe(2);

    component.displayOption = 'warning';
    fixture.detectChanges();
    detailList = fixture.debugElement.queryAll(By.directive(MockValidationDetailComponent));
    expect(detailList.length).toBe(1);

    component.displayOption = 'success';
    fixture.detectChanges();
    detailList = fixture.debugElement.queryAll(By.directive(MockValidationDetailComponent));
    expect(detailList.length).toBe(5);

  })

  // this needs to be moved to the validation detail spec file

/*   it('should render the validation description if one is present in the event of validation error.', () => {
    component.studyValidation = failedValidation;
    fixture.detectChanges();

    const failureElement = fixture.debugElement.query(By.css('.error')).nativeElement;
    expect(failureElement).toBeTruthy();
    expect(failureElement.innerText).toContain('Make sure there are some descriptors.');
  }) */
});
