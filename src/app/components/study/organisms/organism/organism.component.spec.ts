import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { OrganismComponent } from "./organism.component";

describe("OrganismComponent", () => {
  let component: OrganismComponent;
  let fixture: ComponentFixture<OrganismComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [OrganismComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganismComponent);
    component = fixture.componentInstance;
    component.organism = {
      name: "organism",
      variants: ["var1", "another variant"],
      parts: ["leaves", "feet"],
    };
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
