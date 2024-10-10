import { Store } from "@ngxs/store";
import { CommonModule } from "@angular/common";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { EditorService } from "src/app/services/editor.service";
import { MockEditorService } from "src/app/services/editor.service.mock";
import { DOIService } from "src/app/services/publications/doi.service";
import { MockDOIService } from "src/app/services/publications/doi.service.mock.ts";
import { EuropePMCService } from "src/app/services/publications/europePMC.service";
import { MockEuropePMCService } from "src/app/services/publications/europePMC.service.mock";

import { DesignDescriptorComponent } from "./design-descriptor.component";
import { provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";

describe("DesignDescriptorComponent", () => {
  let component: DesignDescriptorComponent;
  let fixture: ComponentFixture<DesignDescriptorComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [DesignDescriptorComponent],
    imports: [CommonModule,
        BrowserModule,
        FormsModule,
        ReactiveFormsModule],
    providers: [
        Store,
        { provide: EditorService, useClass: MockEditorService },
        { provide: DOIService, useClass: MockDOIService },
        { provide: EuropePMCService, useClass: MockEuropePMCService },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
    ]
}).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DesignDescriptorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
