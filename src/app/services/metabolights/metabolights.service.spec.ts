import { NgRedux } from '@angular-redux/store';
import { TestBed, inject } from '@angular/core/testing';
import { IAppState } from 'src/app/store';
import { NgReduxTestingModule, MockNgRedux } from '@angular-redux/store/testing';

import { MetabolightsService } from './metabolights.service';
import { ConfigurationService } from 'src/app/configuration.service';

describe('MetabolightsService', () => {
  let httpClientSpy: { get: jasmine.Spy };
  let service: MetabolightsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MetabolightsService]
    });
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['post']);
    let configService = new ConfigurationService(httpClientSpy as any)
    service = new MetabolightsService(httpClientSpy as any, configService );
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
