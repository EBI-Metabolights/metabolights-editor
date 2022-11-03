import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MockConfigurationService } from '../configuration.mock.service';
import { ConfigurationService } from '../configuration.service';

import { FtpManagementService } from './ftp-management.service';

describe('FtpManagementService', () => {
  let service: FtpManagementService;
  let httpMock: HttpTestingController;
  let configServiceSpy: jasmine.SpyObj<ConfigurationService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [FtpManagementService, {provide: ConfigurationService, useClass: MockConfigurationService}]
    });
    service = TestBed.inject(FtpManagementService);
    configServiceSpy = TestBed.inject(ConfigurationService) as jasmine.SpyObj<ConfigurationService>;
    httpMock = TestBed.inject(HttpTestingController);
    service.service_url = 'https://www.ebi.ac.uk/metabolights/ws/studies/MTBLS1000000/ftp';
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('#synchronise should make a POST request to the sync endpoint', () => {
    service.synchronise().subscribe(res => {
      expect(res).toBeTruthy();
    });
    const httpRequest = httpMock.expectOne(
      'https://www.ebi.ac.uk/metabolights/ws/studies/MTBLS1000000/ftp/sync'
      );
    expect(httpRequest.request.method)
      // .withContext('') can't do this until I have upgraded jasmine
      .toBe('POST');
    httpRequest.flush({status: 'PENDING'})
    httpMock.verify();
  });

  it('#getSyncStatus should make a GET request to the sync-status endpoint', () => {
    service.getSyncStatus().subscribe(res => {
      expect(res).toBeTruthy();
    })
    const req = httpMock.expectOne(
      'https://www.ebi.ac.uk/metabolights/ws/studies/MTBLS1000000/ftp/sync-status');
    expect(req.request.method)
      .toBe('GET');
    req.flush({status: 'PENDING', description: 'N/A', last_update_time: 'never'});
    httpMock.verify();
  });

  it('#syncCalculation should make a POST request with force set to false by default', () => {
    service.syncCalculation().subscribe(res => {
      expect(res).toBeTruthy();
    });
    const req = httpMock.expectOne(
      'https://www.ebi.ac.uk/metabolights/ws/studies/MTBLS1000000/ftp/sync-calculation?force=false'
      );
    expect(req.request.method)
      .toBe('POST');
    req.flush({status: 'PENDING', description: 'N/A', last_update_time: 'never'});
    httpMock.verify();
  });

  it('#syncCalculation should make a POST request with the force flag set to true.', () => {
    service.syncCalculation(true).subscribe(res => {
      expect(res).toBeTruthy();
    });
    const req = httpMock.expectOne(
      'https://www.ebi.ac.uk/metabolights/ws/studies/MTBLS1000000/ftp/sync-calculation?force=true'
    );
    expect(req.request.method).toBe('POST');
    req.flush({status: 'PENDING', description: 'N/A', last_update_time: 'never'});
    httpMock.verify();
  })
});
