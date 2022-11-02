import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FtpManagementComponent } from './ftp-management.component';

describe('FtpManagementComponent', () => {
  let component: FtpManagementComponent;
  let fixture: ComponentFixture<FtpManagementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FtpManagementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FtpManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
