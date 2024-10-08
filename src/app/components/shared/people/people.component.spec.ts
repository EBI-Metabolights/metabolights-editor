import { Store} from '@ngxs/store'
import { CommonModule } from "@angular/common";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { MetabolightsService } from "src/app/services/metabolights/metabolights.service";
import { MockMetabolightsService } from "src/app/services/metabolights/metabolights.service.mock";

import { PeopleComponent } from "./people.component";
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe("PeopleComponent", () => {
  let component: PeopleComponent;
  let fixture: ComponentFixture<PeopleComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [PeopleComponent],
    imports: [BrowserModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule],
    providers: [
        Store,
        { provide: MetabolightsService, useClass: MockMetabolightsService },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
    ]
}).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PeopleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
