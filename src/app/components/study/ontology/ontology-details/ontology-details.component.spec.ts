import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OntologyDetailsComponent } from './ontology-details.component';

describe('OntologyDetailsComponent', () => {
  let component: OntologyDetailsComponent;
  let fixture: ComponentFixture<OntologyDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OntologyDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OntologyDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
