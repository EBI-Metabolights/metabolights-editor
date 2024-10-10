import { CommonModule } from "@angular/common";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { BrowserModule } from "@angular/platform-browser";
import { RouterTestingModule } from "@angular/router/testing";
import { EditorService } from "src/app/services/editor.service";
import { MockEditorService } from "src/app/services/editor.service.mock";
import { DOIService } from "src/app/services/publications/doi.service";
import { MockDOIService } from "src/app/services/publications/doi.service.mock.ts";
import { EuropePMCService } from "src/app/services/publications/europePMC.service";
import { MockEuropePMCService } from "src/app/services/publications/europePMC.service.mock";

import { MetaComponent } from "./meta.component";
import { provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";

describe("MetaComponent", () => {
  let component: MetaComponent;
  let fixture: ComponentFixture<MetaComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [MetaComponent],
    imports: [CommonModule,
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        RouterTestingModule,
        MatButtonToggleModule],
    providers: [
        { provide: EditorService, useClass: MockEditorService },
        { provide: DOIService, useClass: MockDOIService },
        { provide: EuropePMCService, useClass: MockEuropePMCService },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
    ]
}).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MetaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
