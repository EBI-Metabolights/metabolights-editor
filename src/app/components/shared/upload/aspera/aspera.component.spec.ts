import { CommonModule } from '@angular/common';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { EditorService } from 'src/app/services/editor.service';
import { MockEditorService } from 'src/app/services/editor.service.mock';
import { MetabolightsService } from 'src/app/services/metabolights/metabolights.service';
import { MockMetabolightsService } from 'src/app/services/metabolights/metabolights.service.mock';

import { AsperaComponent } from './aspera.component';

describe('AsperaComponent', () => {
  let component: AsperaComponent;
  let fixture: ComponentFixture<AsperaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AsperaComponent ],
      imports: [CommonModule, BrowserModule, FormsModule, ReactiveFormsModule],
      providers: [
        { provide: EditorService, useClass: MockEditorService },
        { provide: MetabolightsService, useClass: MockMetabolightsService}]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AsperaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
