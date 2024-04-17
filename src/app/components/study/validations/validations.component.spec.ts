import { Directive, EventEmitter, Input, Output } from "@angular/core";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { RouterTestingModule } from "@angular/router/testing";
import { of } from "rxjs";
import { failedValidation } from "src/app/models/mtbl/mtbls/mocks/mock-validation";
import { ValidationDetail } from "./validation-detail/validation-detail.component";
import {  Store } from "@ngxs/store";

import { ValidationsComponent } from "./validations.component";
import { EditorService } from "src/app/services/editor.service";
import { MockEditorService } from "src/app/services/editor.service.mock";
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @angular-eslint/directive-selector */
/* eslint-disable @angular-eslint/directive-class-suffix */
@Directive({
  // linter says this should be used as an attribute on a tag but its a mock
  selector: "app-validation-detail",
})
export class MockValidationDetailComponent {
  // eslint-disable-line @angular-eslint/directive-class-suffix
  @Input() isCurator: boolean;
  @Input() validationDetail: ValidationDetail;
  @Output() commentSaved: EventEmitter<{ comment: string }> =
    new EventEmitter();
}

describe("ValidationsComponent", () => {
  let component: ValidationsComponent;
  let fixture: ComponentFixture<ValidationsComponent>;
  let editorService: EditorService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ValidationsComponent, MockValidationDetailComponent],
      imports: [RouterTestingModule, HttpClientTestingModule],
      providers: [
        { provide: EditorService, useClass: MockEditorService },
        Store,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    editorService = TestBed.inject(EditorService);
    fixture = TestBed.createComponent(ValidationsComponent);
    component = fixture.componentInstance;
    spyOn(component, "setUpSubscriptions").and.stub();

    component.studyValidation = failedValidation;

    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should render the correct number of validation detail components based on the config option", () => {
    component.displayOption = "error";
    fixture.detectChanges();
    let detailList = fixture.debugElement.queryAll(
      By.directive(MockValidationDetailComponent)
    );
    expect(detailList.length).toBe(2);

    component.displayOption = "warning";
    fixture.detectChanges();
    detailList = fixture.debugElement.queryAll(
      By.directive(MockValidationDetailComponent)
    );
    expect(detailList.length).toBe(1);

    component.displayOption = "success";
    fixture.detectChanges();
    detailList = fixture.debugElement.queryAll(
      By.directive(MockValidationDetailComponent)
    );
    expect(detailList.length).toBe(5);
  });


});
