import { HttpClientTestingModule } from "@angular/common/http/testing";
import { SpyLocation } from "@angular/common/testing";
import { Store } from "@ngxs/store";

import {
  NgModuleFactoryLoader,
  Compiler,
  Injector,
  Optional,
} from "@angular/core";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import {
  ChildrenOutletContexts,
  Router,
  RouteReuseStrategy,
  ROUTER_CONFIGURATION,
  ROUTES,
  UrlHandlingStrategy,
  UrlSerializer,
} from "@angular/router";
import {
  RouterTestingModule,
  setupTestingRouter,
} from "@angular/router/testing";
import { EditorService } from "src/app/services/editor.service";
import { MockEditorService } from "src/app/services/editor.service.mock";

import { ConsoleComponent } from "./console.component";

describe("ConsoleComponent", () => {
  let component: ConsoleComponent;
  let fixture: ComponentFixture<ConsoleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ConsoleComponent],
      imports: [RouterTestingModule, HttpClientTestingModule],
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
        { provide: EditorService, useClass: MockEditorService },
        { provide: Location, useClass: SpyLocation },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsoleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
