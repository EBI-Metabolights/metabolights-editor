import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { EditorService } from 'src/app/services/editor.service';
import { MockEditorService } from 'src/app/services/editor.service.mock';
import { MetabolightsService } from 'src/app/services/metabolights/metabolights.service';
import { MockMetabolightsService } from 'src/app/services/metabolights/metabolights.service.mock';

import { FilesComponent } from './files.component';

describe('FilesComponent', () => {
  let component: FilesComponent;
  let fixture: ComponentFixture<FilesComponent>;
  let editorService: EditorService;
  let dataService: MetabolightsService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FilesComponent ],
      imports: [HttpClientTestingModule],
      providers: [
        {provide: EditorService, useClass: MockEditorService},
        {provide: MetabolightsService, useClass: MockMetabolightsService}]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    editorService = TestBed.inject(EditorService);
    dataService = TestBed.inject(MetabolightsService);
    fixture = TestBed.createComponent(FilesComponent);
    component = fixture.componentInstance;
    spyOn(component, 'loadAccess').and.stub();
    component.uploadFiles = ['files']

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
