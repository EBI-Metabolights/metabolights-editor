import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { FtpDownloadComponent } from "./ftp.component";

describe("FtpComponent", () => {
  let component: FtpDownloadComponent;
  let fixture: ComponentFixture<FtpDownloadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FtpDownloadComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FtpDownloadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
