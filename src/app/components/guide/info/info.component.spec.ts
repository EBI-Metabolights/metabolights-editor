import { Store } from "@ngxs/store";
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
import { EditorService } from "src/app/services/editor.service";
import { MockEditorService } from "src/app/services/editor.service.mock";

import { InfoComponent } from "./info.component";
import { provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";

describe("InfoComponent", () => {
  let component: InfoComponent;
  let fixture: ComponentFixture<InfoComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [InfoComponent],
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
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
    ]
}).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
