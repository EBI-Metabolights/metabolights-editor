import { provideHttpClientTesting } from "@angular/common/http/testing";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { EditorService } from "src/app/services/editor.service";
import { MockEditorService } from "src/app/services/editor.service.mock";

import { ReleaseDateComponent } from "./release-date.component";
import { provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";

describe("ReleaseDateComponent", () => {
  let component: ReleaseDateComponent;
  let fixture: ComponentFixture<ReleaseDateComponent>;
  let editorService: EditorService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [ReleaseDateComponent],
    imports: [],
    providers: [{ provide: EditorService, useClass: MockEditorService }, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
}).compileComponents();
  }));

  beforeEach(() => {
    editorService = TestBed.inject(EditorService);
    fixture = TestBed.createComponent(ReleaseDateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
