import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoViolationsComponent } from './no-violations.component';

describe('NoViolationsComponent', () => {
  let component: NoViolationsComponent;
  let fixture: ComponentFixture<NoViolationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoViolationsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NoViolationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
