import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PromptRefreshComponent } from './prompt-refresh.component';

describe('PromptRefreshComponent', () => {
  let component: PromptRefreshComponent;
  let fixture: ComponentFixture<PromptRefreshComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PromptRefreshComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PromptRefreshComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
