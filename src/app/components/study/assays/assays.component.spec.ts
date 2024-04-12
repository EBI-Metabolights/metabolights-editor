import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { AssaysComponent } from "./assays.component";

describe("AssaysComponent", () => {
  let component: AssaysComponent;
  let fixture: ComponentFixture<AssaysComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [AssaysComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssaysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
