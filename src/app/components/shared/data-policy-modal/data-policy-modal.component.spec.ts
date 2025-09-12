import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataPolicyModalComponent } from './data-policy-modal.component';

describe('DataPolicyModalComponent', () => {
  let component: DataPolicyModalComponent;
  let fixture: ComponentFixture<DataPolicyModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataPolicyModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DataPolicyModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
