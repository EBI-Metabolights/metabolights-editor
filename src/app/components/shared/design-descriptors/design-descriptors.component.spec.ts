import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { DesignDescriptorsComponent } from "./design-descriptors.component";

describe("DesignDescriptorsComponent", () => {
  let component: DesignDescriptorsComponent;
  let fixture: ComponentFixture<DesignDescriptorsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [DesignDescriptorsComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DesignDescriptorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
