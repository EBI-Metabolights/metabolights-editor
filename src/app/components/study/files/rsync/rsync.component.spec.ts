import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RsyncComponent } from './rsync.component';

describe('RsyncComponent', () => {
  let component: RsyncComponent;
  let fixture: ComponentFixture<RsyncComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RsyncComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RsyncComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
