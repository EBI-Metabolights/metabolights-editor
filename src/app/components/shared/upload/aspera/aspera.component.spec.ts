import { CommonModule } from "@angular/common";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { MockConfigurationService } from "src/app/configuration.mock.service";
import { ConfigurationService } from "src/app/configuration.service";
import { EditorService } from "src/app/services/editor.service";
import { MockEditorService } from "src/app/services/editor.service.mock";
import { MetabolightsService } from "src/app/services/metabolights/metabolights.service";
import { MockMetabolightsService } from "src/app/services/metabolights/metabolights.service.mock";
import { AsperaUploadComponent } from "./aspera.component";

describe("AsperaUploadComponent", () => {
  let component: AsperaUploadComponent;
  let fixture: ComponentFixture<AsperaUploadComponent>;
  let configService: ConfigurationService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AsperaUploadComponent],
      imports: [
        CommonModule,
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientTestingModule,
      ],
      providers: [
        { provide: EditorService, useClass: MockEditorService },
        { provide: MetabolightsService, useClass: MockMetabolightsService },
        { provide: ConfigurationService, useClass: MockConfigurationService },
      ],
    }).compileComponents();
    configService = TestBed.inject(ConfigurationService);
    configService.loadConfiguration();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AsperaUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
