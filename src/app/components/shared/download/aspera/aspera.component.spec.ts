import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { AsperaDownloadComponent } from "./aspera.component";

describe("AsperaComponent", () => {
  let component: AsperaDownloadComponent;
  let fixture: ComponentFixture<AsperaDownloadComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [AsperaDownloadComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AsperaDownloadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
