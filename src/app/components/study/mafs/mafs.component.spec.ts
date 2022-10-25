import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { MafsComponent } from "./mafs.component";

describe("MafsComponent", () => {
  let component: MafsComponent;
  let fixture: ComponentFixture<MafsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MafsComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MafsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
