import { NgRedux } from "@angular-redux/store";
import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { Ontology } from "src/app/models/mtbl/mtbls/common/mtbls-ontology";
import { EditorService } from "src/app/services/editor.service";
import { MockEditorService } from "src/app/services/editor.service.mock";

import { ProtocolComponent } from "./protocol.component";

@Component({ selector: "mtbls-ontology", template: "" })
class MockOntologyComponent {
  @Input("validations") validations: any;
  @Input("values") values: Ontology[] = [];
  @Input("inline") isInline: boolean;
  @Input("id") id: string;

  @Output() changed = new EventEmitter<any>();
}

describe("ProtocolComponent", () => {
  let component: ProtocolComponent;
  let fixture: ComponentFixture<ProtocolComponent>;
  let editorService: EditorService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ProtocolComponent, MockOntologyComponent],
      imports: [FormsModule, ReactiveFormsModule, BrowserModule, CommonModule],
      providers: [
        { provide: EditorService, useClass: MockEditorService },
        NgRedux,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    editorService = TestBed.inject(EditorService);
    fixture = TestBed.createComponent(ProtocolComponent);
    component = fixture.componentInstance;

    component.protocol = {
      parameters: [
        {
          comments: [],
          parameterName: {
            annotationValue: "annotation",
          },
        },
      ],
    };

    spyOn(component, "getAssaysWithProtocol").and.callFake(() => {
      return ["a", "b"];
    });
    spyOn(component, "hasAllSectionsEmpty").and.returnValue(true);
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
