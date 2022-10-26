import { CommonModule } from "@angular/common";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { EditorService } from "src/app/services/editor.service";
import { MockEditorService } from "src/app/services/editor.service.mock";

import { MafComponent } from "./maf.component";

describe("MafComponent", () => {
  let component: MafComponent;
  let fixture: ComponentFixture<MafComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MafComponent],
      imports: [CommonModule, BrowserModule, FormsModule, ReactiveFormsModule],
      providers: [{ provide: EditorService, useClass: MockEditorService }],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MafComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
