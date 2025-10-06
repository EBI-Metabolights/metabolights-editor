import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DatasetLicenseService } from './dataset-license.service';
import { ConfigurationService } from 'src/app/configuration.service';
import { Store } from '@ngxs/store';
import { Ws3Response } from 'src/app/components/study/validations-v2/interfaces/validation-report.interface';
import { DatasetLicense } from './dataset-license.service';

describe('DatasetLicenseService', () => {
  let service: DatasetLicenseService;
  let httpMock: HttpTestingController;
  let configService: jasmine.SpyObj<ConfigurationService>;

  const mockBaseUrl = 'https://mock-api.com'; // Mocked base URL

  beforeEach(() => {
    // Create a spy object for ConfigurationService
    const configServiceSpy = jasmine.createSpyObj('ConfigurationService', ['config']);
    configServiceSpy.config = { ws3URL: mockBaseUrl };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        DatasetLicenseService,
        { provide: ConfigurationService, useValue: configServiceSpy },
        { provide: Store, useValue: {} }, // Provide a mock Store (not used in these tests)
      ],
    });

    service = TestBed.inject(DatasetLicenseService);
    httpMock = TestBed.inject(HttpTestingController);
    configService = TestBed.inject(ConfigurationService) as jasmine.SpyObj<ConfigurationService>;
  });

  afterEach(() => {
    httpMock.verify(); // Ensures there are no outstanding requests
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('#confirmLicenseAgreement', () => {
    it('should send a POST request and return the response', () => {
      const studyId = '123';
      const mockResponse: Ws3Response<{ dataset: DatasetLicense }> = {
        status: 'success',
        successMessage: 'License confirmed',
        errorMessage: null,
        errors: [],
        content: {
          dataset: {
            name: 'CC0 1.0 Universal',
            version: '1.0',
            agreed: true,
            agreeingUser: 'John Doe',
          },
        },
      };

      service.confirmLicenseAgreement(studyId).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${mockBaseUrl}//submissions/v2/dataset-licenses/${studyId}`);
      expect(req.request.method).toBe('POST');
      expect(req.request.headers.get('Accept')).toBe('application/json');
      req.flush(mockResponse);
    });

    it('should handle errors correctly', () => {
      const studyId = '123';
      const mockError = { status: 500, statusText: 'Internal Server Error' };

      service.confirmLicenseAgreement(studyId).subscribe(
        () => fail('Expected an error, but got a response'),
        (error) => {
          expect(error.status).toBe(500);
          expect(error.statusText).toBe('Internal Server Error');
        }
      );

      const req = httpMock.expectOne(`${mockBaseUrl}//submissions/v2/dataset-licenses/${studyId}`);
      req.flush({}, mockError);
    });
  });

  describe('#getLicenseAgreement', () => {
    it('should send a GET request and return the response', () => {
      const studyId = '123';
      const mockResponse: Ws3Response<{ dataset: DatasetLicense }> = {
        status: 'success',
        successMessage: 'Dataset license retrieved',
        errorMessage: null,
        errors: [],
        content: {
          dataset: {
            name: 'CC0 1.0 Universal',
            version: '1.0',
            agreed: true,
            agreeingUser: 'John Doe',
          },
        },
      };

      service.getLicenseAgreement(studyId).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${mockBaseUrl}//submissions/v2/dataset-licenses/${studyId}`);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Accept')).toBe('application/json');
      req.flush(mockResponse);
    });

    it('should handle errors correctly', () => {
      const studyId = '123';
      const mockError = { status: 404, statusText: 'Not Found' };

      service.getLicenseAgreement(studyId).subscribe(
        () => fail('Expected an error, but got a response'),
        (error) => {
          expect(error.status).toBe(404);
          expect(error.statusText).toBe('Not Found');
        }
      );

      const req = httpMock.expectOne(`${mockBaseUrl}//submissions/v2/dataset-licenses/${studyId}`);
      req.flush({}, mockError);
    });
  });
});
