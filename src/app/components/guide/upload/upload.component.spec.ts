import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RawUploadComponent } from './upload.component';

describe('RawUploadComponent', () => {
  let component: RawUploadComponent;
  let fixture: ComponentFixture<RawUploadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RawUploadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RawUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
