import { Component, ViewChild } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { By } from '@angular/platform-browser';
import { CalculationTransformPipe } from './calculation-transform.pipe';

import { FtpManagementComponent } from './ftp-management.component';
import { SyncOpTransformPipe } from './sync-op-transform.pipe';
import { TimezoneTransformPipe } from './timezone.pipe';


@Component({
  selector: 'mtbls-files',
  template: `<app-ftp-management
  *ngIf="!isReadOnly"
  [calculation]="calculation" 
  [ongoingStatus]="ongoingStatus" 
  [isSyncing]="isSyncing" 
  [isCalculating]="isCalculating"
  [requestedStudy]="requestedStudy"
  (checkClicked)="handleCheckClick($event)"
  (syncClicked)="handleSyncClick($event)">
  </app-ftp-management>  
  `
})
class TestFilesComponent {
  calculation = {
    status: 'SYNC_NEEDED',
    description: 'somefile.txt',
    last_update_time: '01/01/1970 20:52:02'
  };
  ongoingStatus = {
    status: "RUNNING",
    description: 'N/A',
    last_update_time: '01/01/1970 20:52:02'
  };
  isSyncing = false;
  isCalculating = false;
  requestedStudy = 'MTBLS1000000';
  @ViewChild(FtpManagementComponent)
  public ftpManagementComponent: FtpManagementComponent;

  handleCheckClick($event) {

  }

  handleSyncClick($event) {

  }

}

describe('FtpManagementComponent', () => {
  let component: TestFilesComponent;
  let testHostFixture: ComponentFixture<TestFilesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TestFilesComponent, FtpManagementComponent, CalculationTransformPipe, SyncOpTransformPipe, TimezoneTransformPipe ],
      imports: [MatIconModule]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    testHostFixture = TestBed.createComponent(TestFilesComponent);
    component = testHostFixture.componentInstance;
    testHostFixture.detectChanges();

    testHostFixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display a loading spinner when syncing or calculating', () => {
    component.isSyncing = true;
    testHostFixture.detectChanges();
    let button = testHostFixture.debugElement.query(By.css('.is-loading'));
    expect(button).toBeTruthy();
  });

  it('should have both boxes be roughly the same height', () => {
    let boxes =  testHostFixture.debugElement.queryAll(By.css('.message.article-box'));
    expect(boxes.length).toBe(2);
    expect(boxes[0].nativeElement.offsetHeight - boxes[1].nativeElement.offsetHeight).toBeLessThan(150);
  
  });

  it('should emit events whenever the buttons are clicked', () => {
    let calcSpy = spyOn(component, 'handleCheckClick');
    let syncSpy = spyOn(component, 'handleSyncClick');

    let buttons = testHostFixture.debugElement.queryAll(By.css('.is-info'));
    expect(buttons.length).toBe(2);
    buttons.forEach(but => {
      but.nativeElement.dispatchEvent(new Event('click'))
    });
    expect(calcSpy).toHaveBeenCalledTimes(1);
    expect(syncSpy).toHaveBeenCalledTimes(1);
  });
});
