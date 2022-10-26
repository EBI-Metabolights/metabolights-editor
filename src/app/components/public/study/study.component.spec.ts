import { NgRedux } from '@angular-redux/store';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import {
  NgModuleFactoryLoader,
  Compiler,
  Injector,
  Optional,
} from '@angular/core';
import {
  Router,
  UrlSerializer,
  ChildrenOutletContexts,
  ROUTES,
  ROUTER_CONFIGURATION,
  UrlHandlingStrategy,
  RouteReuseStrategy,
} from '@angular/router';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {
  RouterTestingModule,
  setupTestingRouter,
} from '@angular/router/testing';
import { EditorService } from 'src/app/services/editor.service';
import { MockEditorService } from 'src/app/services/editor.service.mock';
import { PublicStudyComponent } from './study.component';
import { SpyLocation } from '@angular/common/testing';
import { HttpClientModule } from '@angular/common/http';
import { LabsWorkspaceService } from 'src/app/services/labs-workspace.service';
import { MockLabsWorkspaceService } from 'src/app/services/labs-workspace.service.mock';
import { MockConfigurationService } from 'src/app/configuration.mock.service';
import { ConfigurationService } from 'src/app/configuration.service';

describe('StudyComponent', () => {
  let component: PublicStudyComponent;
  let fixture: ComponentFixture<PublicStudyComponent>;
  let editorService: EditorService;
  let labsWorkspaceService: LabsWorkspaceService;
  let configService: ConfigurationService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PublicStudyComponent],
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
        { provide: LabsWorkspaceService, useClass: MockLabsWorkspaceService },
        {
          provide: ConfigurationService,
          useClass: MockConfigurationService,
        },
        HttpClientModule,
      ],
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

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
