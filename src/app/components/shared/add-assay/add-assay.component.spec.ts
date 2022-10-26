import { CommonModule } from '@angular/common';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { EditorService } from 'src/app/services/editor.service';
import { MockEditorService } from 'src/app/services/editor.service.mock';

import { AddAssayComponent } from './add-assay.component';

describe('AddAssayComponent', () => {
  let component: AddAssayComponent;
  let fixture: ComponentFixture<AddAssayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AddAssayComponent],
      imports: [
        RouterTestingModule,
        CommonModule,
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
      ],
      providers: [{ provide: EditorService, useClass: MockEditorService }],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddAssayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
