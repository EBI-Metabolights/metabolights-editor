import { HttpClientTestingModule } from "@angular/common/http/testing";
import { TestBed, waitForAsync } from "@angular/core/testing";
import { Http } from "@angular/http";
import { By } from "@angular/platform-browser";
import { RouterTestingModule } from "@angular/router/testing";
import { AppComponent } from "./app.component";
import { EditorService } from "./services/editor.service";
import { MockEditorService } from "./services/editor.service.mock";

describe("AppComponent", () => {
  let editorService: EditorService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule],
      declarations: [AppComponent],
      providers: [{ provide: EditorService, useClass: MockEditorService }],
    }).compileComponents();
  }));

  beforeEach(() => {
    editorService = TestBed.inject(EditorService);
  });

  it("should create the app", () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });
});
