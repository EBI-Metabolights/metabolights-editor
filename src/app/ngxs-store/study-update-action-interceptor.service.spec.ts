import { TestBed } from '@angular/core/testing';
import { Injector } from '@angular/core';
import { Store } from '@ngxs/store';
import { SetValidationRunNeeded } from './study/validation/validation.actions';
import { Assay } from './study/assay/assay.actions';
import { Protocols } from './study/protocols/protocols.actions';
import { Samples } from './study/samples/samples.actions';
import { NgxsNextPluginFn } from '@ngxs/store';
import { LoggingMiddleware } from './study-update-action-interceptor.service';
import { IntermittentRefreshActionStack } from './non-study/transitions/transitions.actions';

describe('LoggingMiddleware', () => {
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

    expect(storeSpy.dispatch).not.toHaveBeenCalledWith(new SetValidationRunNeeded(true));
    expect(nextFn).toHaveBeenCalled();
  });

  it('should NOT dispatch SetValidationRunNeeded for actions outside the defined namespaces', () => {
    class SomeUnrelatedAction {
      static readonly type = '[Unrelated] Some Action';
    }

    const unrelatedAction = new SomeUnrelatedAction();
    const nextFn: NgxsNextPluginFn = jasmine.createSpy('nextFn');

    middleware.handle({}, unrelatedAction, nextFn);

    expect(storeSpy.dispatch).not.toHaveBeenCalledWith(new SetValidationRunNeeded(true));
    expect(nextFn).toHaveBeenCalled();
  });

  it('should dispatch IntermittentRefreshActionStack.Sync when an intermittent refresh action is detected', () => {
    const mockAction = new Protocols.Add('newProtocol', {});
    const nextFn: NgxsNextPluginFn = jasmine.createSpy('nextFn');

    middleware.handle({}, mockAction, nextFn);

    expect(storeSpy.dispatch).toHaveBeenCalledWith(new IntermittentRefreshActionStack.Sync(middleware['actionStack']));
    expect(nextFn).toHaveBeenCalled();
  });

  it('should dispatch IntermittentRefreshActionStack.Sync when an intermittent refresh action resolution is detected', () => {
    const mockAction = new Protocols.Add('newProtocol', {});
    middleware['actionStack'].push('[protocols] Create');

    const resolutionAction = new Protocols.Set([null]);
    const nextFn: NgxsNextPluginFn = jasmine.createSpy('nextFn');

    middleware.handle({}, resolutionAction, nextFn);

    expect(storeSpy.dispatch).toHaveBeenCalledWith(new IntermittentRefreshActionStack.Sync(middleware['actionStack']));
    expect(nextFn).toHaveBeenCalled();
  });

  it('should add action to actionStack when isIntermittentRefreshAction returns true', () => {
    const mockAction = new Protocols.Add('newProtocol', {});

    middleware.isIntermittentRefreshAction(mockAction);

    expect(middleware['actionStack']).toContain('[protocols] Create');
  });

  it('should remove action from actionStack when isIntermittentRefreshActionResolution returns true', () => {
    middleware['actionStack'] = ['[protocols] Create'];
    const resolutionAction = new Protocols.Set(['updatedProtocol']);

    middleware.isIntermittentRefreshActionResolution(resolutionAction);

    expect(middleware['actionStack']).not.toContain('[protocols] Create');
  });
});
