import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FactorlistComponent } from './factorlist.component';

describe('FactorlistComponent', () => {
  let component: FactorlistComponent;
  let fixture: ComponentFixture<FactorlistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FactorlistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FactorlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
