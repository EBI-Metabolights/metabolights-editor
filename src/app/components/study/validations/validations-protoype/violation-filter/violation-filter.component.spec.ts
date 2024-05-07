import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViolationFilterComponent } from './violation-filter.component';

describe('ViolationFilterComponent', () => {
  let component: ViolationFilterComponent;
  let fixture: ComponentFixture<ViolationFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViolationFilterComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViolationFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
