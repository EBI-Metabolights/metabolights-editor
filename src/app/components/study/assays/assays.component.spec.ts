import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { AssaysComponent } from "./assays.component";

describe("AssaysComponent", () => {
  let component: AssaysComponent;
  let fixture: ComponentFixture<AssaysComponent>;

  beforeEach(async(() => {
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
