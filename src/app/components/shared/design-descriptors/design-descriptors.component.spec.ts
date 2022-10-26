import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { DesignDescriptorsComponent } from "./design-descriptors.component";

describe("DesignDescriptorsComponent", () => {
  let component: DesignDescriptorsComponent;
  let fixture: ComponentFixture<DesignDescriptorsComponent>;

  beforeEach(async(() => {
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
