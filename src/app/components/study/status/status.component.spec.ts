import { provideHttpClientTesting } from "@angular/common/http/testing";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { EditorService } from "src/app/services/editor.service";
import { MockEditorService } from "src/app/services/editor.service.mock";

import { StatusComponent } from "./status.component";
import { provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";

describe("StatusComponent", () => {
  let component: StatusComponent;
  let fixture: ComponentFixture<StatusComponent>;
  let editorService: EditorService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [StatusComponent],
    imports: [RouterTestingModule],
    providers: [{ provide: EditorService, useClass: MockEditorService }, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
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
