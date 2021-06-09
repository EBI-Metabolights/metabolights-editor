import { NgRedux } from '@angular-redux/store';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { failedValidation } from 'src/app/models/mtbl/mtbls/mocks/mock-validation';
import { EditorService } from 'src/app/services/editor.service';
import { ValidationsComponent } from './validations.component';




fdescribe('ValidationsComponent', () => {
  let component: ValidationsComponent;
  let fixture: ComponentFixture<ValidationsComponent>;
  let editorService: EditorService;

  beforeEach(async(() => {
    const editorSpy = jasmine.createSpyObj('EditorService', ['refreshValidations', 'loadValidations', 'overrideValidations'])
    TestBed.configureTestingModule({
      declarations: [ ValidationsComponent ],
      providers: [ NgRedux,  { provide: EditorService, useValue: editorSpy }],
      imports: []
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ValidationsComponent);
    component = fixture.componentInstance;
    editorService = TestBed.inject(EditorService) as jasmine.SpyObj<EditorService>;

    // The init method subscribes to two state selectors, which would involve a huge amount of
    // boilerplate code to mock out effectively. This state implementation is also likely going to be replaced 
    // as the library itself, NgRedux, has been marked as abandoned by the original developers.
    const stateSubSpy = spyOn(component, 'openStateSubscriptions').and.stub()
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the validation description if one is present in the event of validation error.', () => {
    component.studyValidation = failedValidation;
    component.displayOption = 'all'
    expect(component.studyValidation).toBeTruthy();
    fixture.detectChanges();

    const failureElement = fixture.debugElement.query(By.css('.error')).nativeElement;
    expect(failureElement).toBeTruthy();
    expect(failureElement.innerText).toContain('Make sure there are some descriptors.');

  })
});
