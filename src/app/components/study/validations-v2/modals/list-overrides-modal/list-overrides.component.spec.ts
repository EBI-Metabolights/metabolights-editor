import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListOverridesComponent } from './list-overrides.component';

describe('ListOverridesComponent', () => {
  let component: ListOverridesComponent;
  let fixture: ComponentFixture<ListOverridesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListOverridesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListOverridesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
