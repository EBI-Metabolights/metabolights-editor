import { provideHttpClientTesting } from "@angular/common/http/testing";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { EditorService } from "src/app/services/editor.service";
import { MockEditorService } from "src/app/services/editor.service.mock";
import { StudyFile } from "src/app/models/mtbl/mtbls/interfaces/study-files.interface";

import { DirectoryComponent } from "./directory.component";
import { provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";

describe("DirectoryComponent", () => {
  let component: DirectoryComponent;
  let fixture: ComponentFixture<DirectoryComponent>;
  let editorService: EditorService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [DirectoryComponent],
    imports: [],
    providers: [{ provide: EditorService, useClass: MockEditorService }, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
}).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DirectoryComponent);
    component = fixture.componentInstance;
    editorService = TestBed.inject(EditorService);
    component.file = {
      status: "sactive",
      files: [],
      file: "directoryname",
      createdAt: "11/11/2011",
      timestamp: "",
      directory: false,
      type: ""
    };
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
