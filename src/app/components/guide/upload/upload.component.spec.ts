import { NgRedux } from '@angular-redux/store';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SpyLocation } from '@angular/common/testing';
import {
  NgModuleFactoryLoader,
  Compiler,
  Injector,
  Optional,
} from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {
  Router,
  UrlSerializer,
  ChildrenOutletContexts,
  ROUTES,
  ROUTER_CONFIGURATION,
  UrlHandlingStrategy,
  RouteReuseStrategy,
} from '@angular/router';
import {
  RouterTestingModule,
  setupTestingRouter,
} from '@angular/router/testing';
import { EditorService } from 'src/app/services/editor.service';
import { MockEditorService } from 'src/app/services/editor.service.mock';

import { RawUploadComponent } from './upload.component';

describe('RawUploadComponent', () => {
  let component: RawUploadComponent;
  let fixture: ComponentFixture<RawUploadComponent>;
  let editorService: EditorService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RawUploadComponent],
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
        { provide: EditorService, useClass: MockEditorService },
        { provide: Location, useClass: SpyLocation },
      ],
    }).compileComponents();
    editorService = TestBed.inject(EditorService);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RawUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
