import { NgRedux } from "@angular-redux/store";
import { CommonModule } from "@angular/common";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { RouterTestingModule } from "@angular/router/testing";
import { failedValidation } from "src/app/models/mtbl/mtbls/mocks/mock-validation";
import { EditorService } from "src/app/services/editor.service";
import { MockEditorService } from "src/app/services/editor.service.mock";

import { TitleComponent } from "./title.component";

describe("TitleComponent", () => {
  let component: TitleComponent;
  let fixture: ComponentFixture<TitleComponent>;
  let editorService: EditorService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TitleComponent],
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        BrowserModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
      ],
      providers: [
        { provide: EditorService, useClass: MockEditorService },
        NgRedux,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    editorService = TestBed.inject(EditorService);

    fixture = TestBed.createComponent(TitleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.title = "Please add your study title here";
    component.validations = failedValidation;
    component.requestedStudy = "MTBLSTEST";
    component.isReadOnly = false;
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
