import { HttpClientTestingModule } from "@angular/common/http/testing";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { EditorService } from "src/app/services/editor.service";
import { MockEditorService } from "src/app/services/editor.service.mock";

import { StatusComponent } from "./status.component";

describe("StatusComponent", () => {
  let component: StatusComponent;
  let fixture: ComponentFixture<StatusComponent>;
  let editorService: EditorService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [StatusComponent],
      imports: [RouterTestingModule, HttpClientTestingModule],
      providers: [{ provide: EditorService, useClass: MockEditorService }],
    }).compileComponents();
  }));

  beforeEach(() => {
    editorService = TestBed.inject(EditorService);

    fixture = TestBed.createComponent(StatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.status = "status";
    component.toStatus = "Submitted";
    component.curator = true;
    component.requestedStudy = "MTBLSTEST";
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
