import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { OrganismsComponent } from "./organisms.component";

describe("OrganismsComponent", () => {
  let component: OrganismsComponent;
  let fixture: ComponentFixture<OrganismsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [OrganismsComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganismsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.organisms = [
      {
        name: "organism",
        variants: ["var1", "another variant"],
        parts: ["leaves", "feet"],
      },
    ];
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
