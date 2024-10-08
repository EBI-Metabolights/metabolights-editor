import { CommonModule } from "@angular/common";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { RouterTestingModule } from "@angular/router/testing";
import { EditorService } from "src/app/services/editor.service";
import { MockEditorService } from "src/app/services/editor.service.mock";

import { SamplesComponent } from "./samples.component";
import { provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";

describe("SamplesComponent", () => {
  let component: SamplesComponent;
  let fixture: ComponentFixture<SamplesComponent>;
  let editorService: EditorService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [SamplesComponent],
    imports: [FormsModule,
        ReactiveFormsModule,
        RouterTestingModule,
        CommonModule,
        BrowserModule],
    providers: [{ provide: EditorService, useClass: MockEditorService }, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
}).compileComponents();
  }));

  beforeEach(() => {
    editorService = TestBed.inject(EditorService);

    fixture = TestBed.createComponent(SamplesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
