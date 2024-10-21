import { provideHttpClientTesting } from "@angular/common/http/testing";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { MockConfigurationService } from "src/app/configuration.mock.service";
import { ConfigurationService } from "src/app/configuration.service";
import {
  failedValidation,
  successfulValidation,
} from "src/app/models/mtbl/mtbls/mocks/mock-validation";
import { EditorService } from "src/app/services/editor.service";
import { MockEditorService } from "src/app/services/editor.service.mock";

import { OntologyComponent } from "./ontology.component";
import { provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";

describe("OntologyComponent", () => {
  let component: OntologyComponent;
  let fixture: ComponentFixture<OntologyComponent>;
  let editorService: EditorService;
  let configService: ConfigurationService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [OntologyComponent],
    imports: [],
    providers: [
        { provide: EditorService, useClass: MockEditorService },
        {
            provide: ConfigurationService,
            useClass: MockConfigurationService,
        },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
    ]
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
