import { Injectable, Injector, Type, ApplicationRef, ComponentRef, ViewContainerRef, InjectionToken } from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';

export const MODAL_CONFIG = new InjectionToken<any>('MODAL_CONFIG');

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private overlayRef: OverlayRef;
  private componentRef: ComponentRef<any>;

  constructor(
    private overlay: Overlay,
    private injector: Injector,
    private appRef: ApplicationRef
  ) {}

  open<T>(viewContainerRef: ViewContainerRef, component: Type<T>, config?: any, eventListeners?: { [key: string]: (event: any) => void }): void {
    this.overlayRef = this.overlay.create({
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-dark-backdrop',
      positionStrategy: this.overlay.position()
        .global()
        .centerHorizontally()
        .centerVertically()
    });

    const injector = this.createInjector(config, this.overlayRef);
    const portal = new ComponentPortal(component, null, injector);
    this.componentRef = viewContainerRef.createComponent(portal.component, {
      injector: portal.injector
    });

    this.overlayRef.attach(new ComponentPortal(component, null, injector));

    if (eventListeners) {
      for (const [eventKey, eventListener] of Object.entries(eventListeners)) {
        if (this.componentRef.instance[eventKey] && this.componentRef.instance[eventKey].subscribe) {
          this.componentRef.instance[eventKey].subscribe(eventListener);
        }
      }
    }
  }

  close(): void {
    if (this.overlayRef) {
      this.overlayRef.dispose();
    }
    if (this.componentRef) {
      this.componentRef.destroy();
    }
  }

  private createInjector(config: any, overlayRef: OverlayRef): Injector {
    return Injector.create({
      providers: [
        { provide: MODAL_CONFIG, useValue: config },
        { provide: OverlayRef, useValue: overlayRef }
      ],
      parent: this.injector
    });
  }
}