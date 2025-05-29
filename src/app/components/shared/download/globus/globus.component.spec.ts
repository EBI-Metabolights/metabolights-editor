import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { GlobusDownloadComponent } from "./globus.component";

describe("GlobusComponent", () => {
  let component: GlobusDownloadComponent;
  let fixture: ComponentFixture<GlobusDownloadComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [GlobusDownloadComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GlobusDownloadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
