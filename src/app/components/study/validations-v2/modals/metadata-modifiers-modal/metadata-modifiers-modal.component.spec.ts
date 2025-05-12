import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MetadataModifiersModalComponent } from './metadata-modifiers-modal.component';

describe('MetadataModifiersModalComponent', () => {
  let component: MetadataModifiersModalComponent;
  let fixture: ComponentFixture<MetadataModifiersModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MetadataModifiersModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MetadataModifiersModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
