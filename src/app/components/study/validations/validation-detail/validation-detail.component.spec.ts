
import { HttpClientTestingModule } from "@angular/common/http/testing";
import {  Store } from "@ngxs/store";

import { Directive, EventEmitter, Input, Output } from "@angular/core";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatDividerModule } from "@angular/material/divider";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon/";
import { MatInputModule } from "@angular/material/input";
import { By } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MockConfigurationService } from "src/app/configuration.mock.service";
import { ConfigurationService } from "src/app/configuration.service";
import { failedValidation } from "src/app/models/mtbl/mtbls/mocks/mock-validation";
import { EditorService } from "src/app/services/editor.service";
import { MockEditorService } from "src/app/services/editor.service.mock";
import { ValidationDetailCommentComponent } from "./comment/validation-detail-comment.component";

import { ValidationDetailComponent } from "./validation-detail.component";

// disabling this rather than refactor our entire validation pipeline to be camelcase
/* eslint-disable @typescript-eslint/naming-convention*/
describe("ValidationDetailComponent", () => {
  let component: ValidationDetailComponent;
  let fixture: ComponentFixture<ValidationDetailComponent>;
  let configService: ConfigurationService;
  let editorService: EditorService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        ValidationDetailComponent,
        ValidationDetailCommentComponent,
      ],
      imports: [
        BrowserAnimationsModule,
        MatIconModule,
        MatInputModule,
        MatExpansionModule,
        MatDividerModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        HttpClientTestingModule,
      ],
      providers: [
        { provide: ConfigurationService, useClass: MockConfigurationService },
        { provide: EditorService, useClass: MockEditorService },
        Store
        
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    configService = TestBed.inject(ConfigurationService);
    configService.loadConfiguration();
    editorService = TestBed.inject(EditorService);
    fixture = TestBed.createComponent(ValidationDetailComponent);
    component = fixture.componentInstance;
    component.validationDetail = {
      message:
        "File 'QC1_NEG.raw' is missing or not correct for column 'Raw Spectral Data File' " +
        "(a_MTBLS2411_LC-MS_negative_reverse-phase_metabolite_profiling.txt)",
      section: "basic",
      val_sequence: "basic_17",
      status: "error",
      metadata_file: "s_MTBLS1898.txt",
      value: "",
      description:
        "File 'QC1_NEG.raw' does not exist (a_MTBLS2411_LC-MS_negative_reverse-phase_metabolite_profiling.txt)",
      val_override: "false",
      val_message: "",
      comment: "a sensible comment",
    };
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });


  describe("Curator View Tests", () => {
    beforeEach(() => {
      component.isCurator = true;
      component.validationDetail = {
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
      };
      fixture.detectChanges();
    });

    it("should only show the override button on validation details that represent errors", () => {
      let spanElement = fixture.debugElement.query(By.css(".override"));
      expect(spanElement).toBeTruthy();

      component.validationDetail.status = "warning";
      fixture.detectChanges();
      spanElement = fixture.debugElement.query(By.css(".override"));
      expect(spanElement).toBeNull();
    });
  });

  describe("User View Tests", () => {
    it("should render a description if one is present and the detail represents an error or warning", () => {
      let descriptionElement = fixture.debugElement.query(
        By.css(".val-description")
      );
      expect(descriptionElement).toBeTruthy();

      component.validationDetail.status = "success";
      fixture.detectChanges();

      descriptionElement = fixture.debugElement.query(
        By.css(".val-description")
      );
      expect(descriptionElement).toBeNull();
    });
  });
});
