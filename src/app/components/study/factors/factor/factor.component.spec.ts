import { NgRedux } from "@angular-redux/store";
import { CommonModule } from "@angular/common";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { EditorService } from "src/app/services/editor.service";
import { MockEditorService } from "src/app/services/editor.service.mock";

import { FactorComponent } from "./factor.component";

describe("FactorComponent", () => {
  let component: FactorComponent;
  let fixture: ComponentFixture<FactorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FactorComponent],
      imports: [CommonModule, BrowserModule, FormsModule, ReactiveFormsModule],
      providers: [
        { provide: EditorService, useClass: MockEditorService },
        NgRedux,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FactorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
