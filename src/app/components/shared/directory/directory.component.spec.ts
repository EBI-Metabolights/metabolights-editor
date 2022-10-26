import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { EditorService } from 'src/app/services/editor.service';
import { MockEditorService } from 'src/app/services/editor.service.mock';

import { DirectoryComponent } from './directory.component';

describe('DirectoryComponent', () => {
  let component: DirectoryComponent;
  let fixture: ComponentFixture<DirectoryComponent>;
  let editorService: EditorService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DirectoryComponent],
      imports: [HttpClientTestingModule],
      providers: [{ provide: EditorService, useClass: MockEditorService }],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DirectoryComponent);
    component = fixture.componentInstance;
    editorService = TestBed.inject(EditorService);
    component.file = {
      status: 'sactive',
      files: ['file1?', 'file2?'],
      file: 'directoryname',
      createdAt: '11/11/2011',
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
