import { provideHttpClientTesting } from "@angular/common/http/testing";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { EditorService } from "src/app/services/editor.service";
import { MockEditorService } from "src/app/services/editor.service.mock";

import { CurationStatusComponent } from "./curation-status.component";
import { provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";

describe("StatusComponent", () => {
  let component: CurationStatusComponent;
  let fixture: ComponentFixture<CurationStatusComponent>;
  let editorService: EditorService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [CurationStatusComponent],
    imports: [RouterTestingModule],
    providers: [{ provide: EditorService, useClass: MockEditorService }, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
}).compileComponents();
  }));

  beforeEach(() => {
    editorService = TestBed.inject(EditorService);

    fixture = TestBed.createComponent(CurationStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.status = "status";
    component.toStatus = "Provisional";
    component.curator = true;
    component.requestedStudy = "MTBLSTEST";
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
