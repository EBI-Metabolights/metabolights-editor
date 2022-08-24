import { CommonModule } from '@angular/common';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { MetabolightsService } from 'src/app/services/metabolights/metabolights.service';
import { MockMetabolightsService } from 'src/app/services/metabolights/metabolights.service.mock';
import { FTPUploadComponent } from './ftp.component';


describe('FtpUploadComponent', () => {
  let component: FTPUploadComponent;
  let fixture: ComponentFixture<FTPUploadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FTPUploadComponent ],
      imports: [CommonModule, BrowserModule, FormsModule, ReactiveFormsModule],
      providers: [{provide: MetabolightsService, useClass: MockMetabolightsService}]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FTPUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
