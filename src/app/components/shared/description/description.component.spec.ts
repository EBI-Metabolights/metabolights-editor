import { NgRedux } from '@angular-redux/store';
import { CommonModule } from '@angular/common';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { Browser } from 'selenium-webdriver';
import { EditorService } from 'src/app/services/editor.service';
import { MockEditorService } from 'src/app/services/editor.service.mock';

import { DescriptionComponent } from './description.component';

describe('DescriptionComponent', () => {
  let component: DescriptionComponent;
  let fixture: ComponentFixture<DescriptionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DescriptionComponent],
      imports: [CommonModule, BrowserModule, FormsModule, ReactiveFormsModule],
      providers: [
        { provide: EditorService, useClass: MockEditorService },
        NgRedux,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DescriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
