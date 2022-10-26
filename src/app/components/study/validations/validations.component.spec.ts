import { Directive, EventEmitter, Input, Output } from "@angular/core";
import { NgRedux } from "@angular-redux/store";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { RouterTestingModule } from "@angular/router/testing";
import { of } from "rxjs";
import { failedValidation } from "src/app/models/mtbl/mtbls/mocks/mock-validation";
import { ValidationDetail } from "./validation-detail/validation-detail.component";

import { ValidationsComponent } from "./validations.component";
import { EditorService } from "src/app/services/editor.service";
import { MockEditorService } from "src/app/services/editor.service.mock";
/* eslint-disable @typescript-eslint/naming-convention */

@Directive({
  // linter says this should be used as an attribute on a tag but its a mock
  selector: "app-validation-detail", // eslint-disable-line @angular-eslint/directive-selector
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

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ValidationsComponent, MockValidationDetailComponent],
      imports: [RouterTestingModule, HttpClientTestingModule],
      providers: [
        { provide: EditorService, useClass: MockEditorService },
        NgRedux,
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

  it("should make a call to the editor service if a comment is added, and validations should be refreshed", () => {
    spyOn(editorService, "addComment").and.returnValue(
      of({ success: "a successful message" })
    );
    spyOn(editorService, "loadValidations").and.stub();
    spyOn(editorService, "refreshValidations").and.returnValue(
      of({ success: "another message" })
    );

    component.handleCommentSaved(
      { comment: "comment" },
      {
        message:
          "File 'QC1_NEG.raw' is missing or not correct for column 'Raw Spectral Data File'" +
          " (a_MTBLS2411_LC-MS_negative_reverse-phase_metabolite_profiling.txt)",
        section: "basic",
        val_sequence: "basic_17",
        status: "error",
        metadata_file: "s_MTBLS1898.txt",
        value: "",
        description:
          "File 'QC1_NEG.raw' does not exist (a_MTBLS2411_LC-MS_negative_reverse-phase_metabolite_profiling.txt)",
        val_override: "false",
        val_message: "",
        comment: "Grabaogoli",
      }
    );

    expect(editorService.addComment).toHaveBeenCalledTimes(1);
    expect(editorService.loadValidations).toHaveBeenCalledTimes(1);
    expect(editorService.refreshValidations).toHaveBeenCalledTimes(1);
  });
});
