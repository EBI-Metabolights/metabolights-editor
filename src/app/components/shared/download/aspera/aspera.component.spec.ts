import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AsperaDownloadComponent } from './aspera.component';

describe('AsperaDownloadComponent', () => {
  let component: AsperaDownloadComponent;
  let fixture: ComponentFixture<AsperaDownloadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AsperaDownloadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AsperaDownloadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
