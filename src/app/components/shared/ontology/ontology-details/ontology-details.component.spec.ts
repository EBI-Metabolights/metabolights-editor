import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { on } from "events";
import { Ontology } from "src/app/models/mtbl/mtbls/common/mtbls-ontology";
import { OntologySourceReference } from "src/app/models/mtbl/mtbls/common/mtbls-ontology-reference";
import { EditorService } from "src/app/services/editor.service";
import { MockEditorService } from "src/app/services/editor.service.mock";

import { OntologyDetailsComponent } from "./ontology-details.component";

describe("OntologyDetailsComponent", () => {
  let component: OntologyDetailsComponent;
  let fixture: ComponentFixture<OntologyDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [OntologyDetailsComponent],
      imports: [],
      providers: [{ provide: EditorService, useClass: MockEditorService }],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OntologyDetailsComponent);
    component = fixture.componentInstance;
    component.value = new Ontology();
    component.value.name = "name";
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
