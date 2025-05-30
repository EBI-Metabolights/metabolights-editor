import { Store} from '@ngxs/store'
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

import { PublicationComponent } from "./publication.component";
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe("PublicationComponent", () => {
  let component: PublicationComponent;
  let fixture: ComponentFixture<PublicationComponent>;
  let doiService: DOIService;
  let editorService: EditorService;
  let europePMCService: EuropePMCService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [PublicationComponent],
    imports: [FormsModule,
        ReactiveFormsModule,
        CommonModule,
        BrowserModule],
    providers: [
        { provide: DOIService, useClass: MockDOIService },
        { provide: EditorService, useClass: MockEditorService },
        { provide: EuropePMCService, useClass: MockEuropePMCService },
        Store,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
    ]
}).compileComponents();
  }));

  beforeEach(() => {
    editorService = TestBed.inject(EditorService);
    doiService = TestBed.inject(DOIService);
    europePMCService = TestBed.inject(EuropePMCService);
    fixture = TestBed.createComponent(PublicationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
