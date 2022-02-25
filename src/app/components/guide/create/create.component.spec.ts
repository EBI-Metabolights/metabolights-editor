import { NgRedux } from '@angular-redux/store';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SpyLocation } from '@angular/common/testing';
import { NgModuleFactoryLoader, Compiler, Injector, Optional } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, UrlSerializer, ChildrenOutletContexts, ROUTES, ROUTER_CONFIGURATION, UrlHandlingStrategy, RouteReuseStrategy } from '@angular/router';
import { RouterTestingModule, setupTestingRouter } from '@angular/router/testing';
import { EditorService } from 'src/app/services/editor.service';
import { MockEditorService } from 'src/app/services/editor.service.mock';

import { CreateComponent } from './create.component';

describe('CreateComponent', () => {
  let component: CreateComponent;
  let fixture: ComponentFixture<CreateComponent>;
  let editorService: EditorService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateComponent ],
      imports: [RouterTestingModule, HttpClientTestingModule],
      providers: [
        NgRedux,
        {
        provide: Router,
        useFactory: setupTestingRouter,
        deps: [
          UrlSerializer, ChildrenOutletContexts, Location, NgModuleFactoryLoader, Compiler, Injector,
          ROUTES, ROUTER_CONFIGURATION, [UrlHandlingStrategy, new Optional()],
          [RouteReuseStrategy, new Optional()]
        ]
      },
      { provide: Location, useClass: SpyLocation },
      { provide: EditorService, useClass: MockEditorService}]
    })
    .compileComponents();
    editorService = TestBed.inject(EditorService)
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
