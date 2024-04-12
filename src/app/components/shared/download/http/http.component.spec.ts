import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { HttpDownloadComponent } from "./http.component";

describe("HttpComponent", () => {
  let component: HttpDownloadComponent;
  let fixture: ComponentFixture<HttpDownloadComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [HttpDownloadComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HttpDownloadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
