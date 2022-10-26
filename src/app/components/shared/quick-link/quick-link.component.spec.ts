import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { QuickLinkComponent } from './quick-link.component';

describe('QuickLinkComponent', () => {
  let component: QuickLinkComponent;
  let fixture: ComponentFixture<QuickLinkComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [QuickLinkComponent],
      imports: [RouterTestingModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuickLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
