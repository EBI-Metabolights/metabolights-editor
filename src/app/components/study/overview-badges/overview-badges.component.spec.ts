import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OverviewBadgesComponent } from './overview-badges.component';

describe('OverviewBadgesComponent', () => {
  let component: OverviewBadgesComponent;
  let fixture: ComponentFixture<OverviewBadgesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OverviewBadgesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OverviewBadgesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
