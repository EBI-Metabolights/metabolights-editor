import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MafComponent } from './maf.component';

describe('MafComponent', () => {
  let component: MafComponent;
  let fixture: ComponentFixture<MafComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MafComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MafComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
