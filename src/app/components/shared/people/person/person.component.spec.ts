import { Store} from '@ngxs/store'
import { CommonModule } from "@angular/common";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { EditorService } from "src/app/services/editor.service";
import { MockEditorService } from "src/app/services/editor.service.mock";

import { PersonComponent } from "./person.component";

describe("PersonComponent", () => {
  let component: PersonComponent;
  let fixture: ComponentFixture<PersonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PersonComponent],
      imports: [CommonModule, BrowserModule, ReactiveFormsModule, FormsModule],
      providers: [
        { provide: EditorService, useClass: MockEditorService },
        Store,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PersonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
