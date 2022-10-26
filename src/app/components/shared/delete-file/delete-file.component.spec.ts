import { CommonModule } from '@angular/common';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { EditorService } from 'src/app/services/editor.service';
import { MockEditorService } from 'src/app/services/editor.service.mock';
import { MetabolightsService } from 'src/app/services/metabolights/metabolights.service';
import { MockMetabolightsService } from 'src/app/services/metabolights/metabolights.service.mock';

import { DeleteFileComponent } from './delete-file.component';

describe('DeleteComponent', () => {
  let component: DeleteFileComponent;
  let fixture: ComponentFixture<DeleteFileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DeleteFileComponent],
      imports: [CommonModule, BrowserModule, FormsModule, ReactiveFormsModule],
      providers: [
        { provide: EditorService, useClass: MockEditorService },
        { provide: MetabolightsService, useClass: MockMetabolightsService },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
