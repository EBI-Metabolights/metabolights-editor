import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { EditorService } from 'src/app/services/editor.service';
import { MockEditorService } from 'src/app/services/editor.service.mock';

import { AssayDetailsComponent } from './assay-details.component';

describe('AssayDetailsComponent', () => {
  let component: AssayDetailsComponent;
  let fixture: ComponentFixture<AssayDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssayDetailsComponent ],
      imports: [],
      providers: [{ provide: EditorService, useClass: MockEditorService }]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssayDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
