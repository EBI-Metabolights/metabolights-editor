import { HttpClientTestingModule } from "@angular/common/http/testing";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { MockConfigurationService } from "src/app/configuration.mock.service";
import { ConfigurationService } from "src/app/configuration.service";
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
  let configService: ConfigurationService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [OntologyComponent],
      imports: [HttpClientTestingModule],
      providers: [
        { provide: EditorService, useClass: MockEditorService },
        {
          provide: ConfigurationService,
          useClass: MockConfigurationService,
        },
      ],
    });
    configService = TestBed.inject(ConfigurationService);
    configService.loadConfiguration();
    TestBed.compileComponents();
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
