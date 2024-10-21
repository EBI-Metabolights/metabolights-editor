import { CommonModule } from "@angular/common";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { SpyLocation } from "@angular/common/testing";
import {
  NgModuleFactoryLoader,
  Compiler,
  Injector,
  Optional,
} from "@angular/core";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
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
import { MockConfigurationService } from "src/app/configuration.mock.service";
import { ConfigurationService } from "src/app/configuration.service";
import { EditorService } from "src/app/services/editor.service";
import { MockEditorService } from "src/app/services/editor.service.mock";
import { Store } from "@ngxs/store";

import { LoginComponent } from "./login.component";
import { provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";

describe("LoginComponent", () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let configService: ConfigurationService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [LoginComponent],
    imports: [RouterTestingModule,
        CommonModule,
        BrowserModule,
        FormsModule,
        ReactiveFormsModule],
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
        { provide: ConfigurationService, useClass: MockConfigurationService },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
    ]
});
    configService = TestBed.inject(ConfigurationService);
    configService.loadConfiguration();
    TestBed.compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
