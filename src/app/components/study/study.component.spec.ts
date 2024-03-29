import { NgRedux } from "@angular-redux/store";
import {
  NgModuleFactoryLoader,
  Compiler,
  Injector,
  Optional,
} from "@angular/core";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import {
  Router,
  UrlSerializer,
  ChildrenOutletContexts,
  ROUTES,
  ROUTER_CONFIGURATION,
  UrlHandlingStrategy,
  RouteReuseStrategy,
} from "@angular/router";
import {
  RouterTestingModule,
  setupTestingRouter,
} from "@angular/router/testing";
import { SpyLocation } from "@angular/common/testing";

import { StudyComponent } from "./study.component";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { EditorService } from "src/app/services/editor.service";
import { MockEditorService } from "src/app/services/editor.service.mock";
import { ConfigurationService } from "src/app/configuration.service";
import { MockConfigurationService } from "src/app/configuration.mock.service";

describe("StudyComponent", () => {
  let component: StudyComponent;
  let fixture: ComponentFixture<StudyComponent>;
  let editorService: EditorService;
  let configService: ConfigurationService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [StudyComponent],
      imports: [RouterTestingModule, HttpClientTestingModule],
      providers: [
        NgRedux,
        {
          provide: Router,
          useFactory: setupTestingRouter,
          deps: [
            UrlSerializer,
            ChildrenOutletContexts,
            Location,
            NgModuleFactoryLoader,
            Compiler,
            Injector,
            ROUTES,
            ROUTER_CONFIGURATION,
            [UrlHandlingStrategy, new Optional()],
            [RouteReuseStrategy, new Optional()],
          ],
        },
        { provide: Location, useClass: SpyLocation },
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
    fixture = TestBed.createComponent(StudyComponent);
    component = fixture.componentInstance;
    spyOn(component, "setUpSubscriptions").and.stub();
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
