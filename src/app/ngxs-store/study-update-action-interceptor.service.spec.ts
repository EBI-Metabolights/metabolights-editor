import { TestBed } from '@angular/core/testing';
import { Injector } from '@angular/core';
import { Store } from '@ngxs/store';
import { SetValidationRunNeeded } from './study/validation/validation.actions';
import { Assay } from './study/assay/assay.actions';
import { Descriptors, Factors } from './study/descriptors/descriptors.action';
import { People, Publications, StudyAbstract, StudyReleaseDate, Title } from './study/general-metadata/general-metadata.actions';
import { MAF } from './study/maf/maf.actions';
import { Protocols } from './study/protocols/protocols.actions';
import { Samples } from './study/samples/samples.actions';
import { NgxsNextPluginFn } from '@ngxs/store';
import { LoggingMiddleware } from './study-update-action-interceptor.service';

fdescribe('LoggingMiddleware', () => {
  let middleware: LoggingMiddleware;
  let storeSpy: jasmine.SpyObj<Store>;
  let injector: Injector;

  beforeEach(() => {
    storeSpy = jasmine.createSpyObj('Store', ['dispatch']);

    TestBed.configureTestingModule({
      providers: [
        LoggingMiddleware,
        { provide: Store, useValue: storeSpy }, 
      ],
    });

    injector = TestBed.inject(Injector);
    middleware = new LoggingMiddleware(injector);

    // Manually inject Store into middleware
    middleware['store'] = storeSpy;
  });

  it('should be created', () => {
    expect(middleware).toBeTruthy();
  });

  it('should dispatch SetValidationRunNeeded when an action from a namespace is dispatched (excluding Get, Set, Organise)', () => {
    const mockAction = new Assay.Delete('fake', 'MTBLS11019'); 
    const nextFn: NgxsNextPluginFn = jasmine.createSpy('nextFn');

    middleware.handle({}, mockAction, nextFn);

    expect(storeSpy.dispatch).toHaveBeenCalledWith(new SetValidationRunNeeded(true));
    expect(nextFn).toHaveBeenCalled();
  });

  it('should NOT dispatch SetValidationRunNeeded for actions named Get, Set, or Organise', () => {
    const mockAction = new Samples.Get('123'); // A "Get" action that should be ignored
    const nextFn: NgxsNextPluginFn = jasmine.createSpy('nextFn');

    middleware.handle({}, mockAction, nextFn);

    expect(storeSpy.dispatch).not.toHaveBeenCalled();
    expect(nextFn).toHaveBeenCalled();
  });

  it('should NOT dispatch SetValidationRunNeeded for actions outside the defined namespaces', () => {
    class SomeUnrelatedAction {
      static readonly type = '[Unrelated] Some Action';
    }

    const unrelatedAction = new SomeUnrelatedAction();
    const nextFn: NgxsNextPluginFn = jasmine.createSpy('nextFn');

    middleware.handle({}, unrelatedAction, nextFn);

    expect(storeSpy.dispatch).not.toHaveBeenCalled();
    expect(nextFn).toHaveBeenCalled();
  });
});