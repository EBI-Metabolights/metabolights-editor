import { HttpClientTestingModule } from "@angular/common/http/testing";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import {
  failedValidation,
  successfulValidation,
} from "src/app/models/mtbl/mtbls/mocks/mock-validation";
import { EditorService } from "src/app/services/editor.service";
import { MockEditorService } from "src/app/services/editor.service.mock";

import { OntologyComponent } from "./ontology.component";

describe("OntologyComponent", () => {
  let component: OntologyComponent;
  let fixture: ComponentFixture<OntologyComponent>;
  let editorService: EditorService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [OntologyComponent],
      imports: [HttpClientTestingModule],
      providers: [{ provide: EditorService, useClass: MockEditorService }],
    }).compileComponents();
  }));

  beforeEach(() => {
    editorService = TestBed.inject(EditorService);
    fixture = TestBed.createComponent(OntologyComponent);
    component = fixture.componentInstance;
    component.validations = successfulValidation;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
