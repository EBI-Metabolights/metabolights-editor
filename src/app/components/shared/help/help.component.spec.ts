import { ConfigurableFocusTrap } from "@angular/cdk/a11y";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { MockConfigurationService } from "src/app/configuration.mock.service";
import { ConfigurationService } from "src/app/configuration.service";

import { HelpComponent } from "./help.component";

describe("HelpComponent", () => {
  let component: HelpComponent;
  let fixture: ComponentFixture<HelpComponent>;
  let configService: ConfigurationService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [HelpComponent],
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: ConfigurationService,
          useClass: MockConfigurationService,
        },
      ],
    });
    configService = TestBed.inject(ConfigurationService);
    configService.loadConfiguration();
    TestBed.compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HelpComponent);
    component = fixture.componentInstance;

    component.target = "all";
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
