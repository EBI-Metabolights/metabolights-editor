import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatasetLicenseStaticPageComponent } from './dataset-license-static.component';

describe('DatasetLicenseComponent', () => {
  let component: DatasetLicenseStaticPageComponent;
  let fixture: ComponentFixture<DatasetLicenseStaticPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DatasetLicenseStaticPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DatasetLicenseStaticPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
