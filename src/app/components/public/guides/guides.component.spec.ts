import { NgRedux } from '@angular-redux/store';
import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SpyLocation } from '@angular/common/testing';
import {
  NgModuleFactoryLoader,
  Compiler,
  Injector,
  Optional,
} from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
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

import { GuidesComponent } from './guides.component';

describe('GuidesComponent', () => {
  let component: GuidesComponent;
  let fixture: ComponentFixture<GuidesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [GuidesComponent],
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        CommonModule,
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
      ],
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
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GuidesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
