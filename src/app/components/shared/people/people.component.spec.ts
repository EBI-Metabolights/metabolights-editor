import { Store} from '@ngxs/store'
import { CommonModule } from "@angular/common";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { MetabolightsService } from "src/app/services/metabolights/metabolights.service";
import { MockMetabolightsService } from "src/app/services/metabolights/metabolights.service.mock";

import { PeopleComponent } from "./people.component";

describe("PeopleComponent", () => {
  let component: PeopleComponent;
  let fixture: ComponentFixture<PeopleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PeopleComponent],
      imports: [
        HttpClientTestingModule,
        BrowserModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
      ],
      providers: [
        Store,
        { provide: MetabolightsService, useClass: MockMetabolightsService },
      ],
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
