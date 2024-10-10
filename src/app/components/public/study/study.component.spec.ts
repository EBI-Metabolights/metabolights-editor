import { Store } from "@ngxs/store";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import {
  NgModuleFactoryLoader,
  Compiler,
  Injector,
  Optional,
} from "@angular/core";
import {
  Router,
  UrlSerializer,
  ChildrenOutletContexts,
  ROUTES,
  ROUTER_CONFIGURATION,
  UrlHandlingStrategy,
  RouteReuseStrategy,
} from "@angular/router";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import {
  RouterTestingModule,
  setupTestingRouter,
} from "@angular/router/testing";
import { EditorService } from "src/app/services/editor.service";
import { MockEditorService } from "src/app/services/editor.service.mock";
import { PublicStudyComponent } from "./study.component";
import { SpyLocation } from "@angular/common/testing";
import { provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";
import { LabsWorkspaceService } from "src/app/services/labs-workspace.service";
import { MockLabsWorkspaceService } from "src/app/services/labs-workspace.service.mock";
import { MockConfigurationService } from "src/app/configuration.mock.service";
import { ConfigurationService } from "src/app/configuration.service";

describe("StudyComponent", () => {
  let component: PublicStudyComponent;
  let fixture: ComponentFixture<PublicStudyComponent>;
  let editorService: EditorService;
  let labsWorkspaceService: LabsWorkspaceService;
  let configService: ConfigurationService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [PublicStudyComponent],
    imports: [RouterTestingModule],
    providers: [
        Store,
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
        { provide: LabsWorkspaceService, useClass: MockLabsWorkspaceService },
        {
            provide: ConfigurationService,
            useClass: MockConfigurationService,
        },
        HttpClientModule,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
    ]
});
    configService = TestBed.inject(ConfigurationService);
    configService.loadConfiguration();
    TestBed.compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PublicStudyComponent);
    component = fixture.componentInstance;
    editorService = TestBed.inject(EditorService);
    labsWorkspaceService = TestBed.inject(LabsWorkspaceService);

    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
