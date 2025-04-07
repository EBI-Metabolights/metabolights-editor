import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataPolicyComponent } from './data-policy.component';

describe('DataPolicyComponent', () => {
  let component: DataPolicyComponent;
  let fixture: ComponentFixture<DataPolicyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataPolicyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DataPolicyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
