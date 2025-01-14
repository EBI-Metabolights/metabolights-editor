import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OverrideModalComponent } from './override-modal.component';

describe('OverrideModalComponent', () => {
  let component: OverrideModalComponent;
  let fixture: ComponentFixture<OverrideModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OverrideModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OverrideModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
