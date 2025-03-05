import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatasetLicenseComponent } from './dataset-license.component';

describe('DatasetLicenseComponent', () => {
  let component: DatasetLicenseComponent;
  let fixture: ComponentFixture<DatasetLicenseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DatasetLicenseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DatasetLicenseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
