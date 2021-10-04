import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FTPComponent } from './ftp.component';

describe('FtpComponent', () => {
  let component: FTPComponent;
  let fixture: ComponentFixture<FTPComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FTPComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FTPComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
