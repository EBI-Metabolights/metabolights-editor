import { provideHttpClientTesting } from "@angular/common/http/testing";
import { SpyLocation } from "@angular/common/testing";
import {
  NgModuleFactoryLoader,
  Compiler,
  Injector,
  Optional,
} from "@angular/core";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
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

import { ProgressComponent } from "./progress.component";
import { provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";

describe("ProgressComponent", () => {
  let component: ProgressComponent;
  let fixture: ComponentFixture<ProgressComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [ProgressComponent],
    imports: [RouterTestingModule],
    providers: [
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
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
    ]
}).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
