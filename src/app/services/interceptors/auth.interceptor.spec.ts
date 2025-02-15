import { TestBed } from '@angular/core/testing';
import { HttpClient} from '@angular/common/http';
import { HTTP_INTERCEPTORS, HttpErrorResponse } from '@angular/common/http';
import { AuthInterceptor } from './auth.interceptor';
import { HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';

describe('AuthInterceptor', () => {
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
        { provide: Router, useValue: routerSpy },
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify(); // Ensure no pending requests
  });

  it('should redirect to login on 401 error', () => {
    httpClient.get('/test').subscribe({
      next: () => fail('Expected an error, not a response'),
      error: (error: HttpErrorResponse) => {
        expect(error.status).toBe(401);
      },
    });

    const req = httpTestingController.expectOne('/test');

    // Simulate a 401 response
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should not redirect on non-401 errors', () => {
    httpClient.get('/test').subscribe({
      next: () => fail('Expected an error, not a response'),
      error: (error: HttpErrorResponse) => {
        expect(error.status).toBe(500);
      },
    });

    const req = httpTestingController.expectOne('/test');

    // Simulate a 500 response
    req.flush('Server error', { status: 500, statusText: 'Server Error' });

    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });
});