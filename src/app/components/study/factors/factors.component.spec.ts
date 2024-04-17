import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { FactorsComponent } from "./factors.component";

describe("FactorsComponent", () => {
  let component: FactorsComponent;
  let fixture: ComponentFixture<FactorsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [FactorsComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FactorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
