import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OntologyTermModalComponent } from './ontology-term-modal.component';

describe('OntologyTermModalComponent', () => {
  let component: OntologyTermModalComponent;
  let fixture: ComponentFixture<OntologyTermModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OntologyTermModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OntologyTermModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
