import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { EditorService } from 'src/app/services/editor.service';
import { MockEditorService } from 'src/app/services/editor.service.mock';

import { ReleaseDateComponent } from './release-date.component';

describe('ReleaseDateComponent', () => {
  let component: ReleaseDateComponent;
  let fixture: ComponentFixture<ReleaseDateComponent>;
  let editorService: EditorService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ReleaseDateComponent],
      imports: [HttpClientTestingModule],
      providers: [{ provide: EditorService, useClass: MockEditorService }],
    }).compileComponents();
  }));

  beforeEach(() => {
    editorService = TestBed.inject(EditorService);
    fixture = TestBed.createComponent(ReleaseDateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
