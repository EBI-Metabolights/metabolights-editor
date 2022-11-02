import { Component, OnInit, Input, OnDestroy, AfterViewInit, OnChanges, SimpleChange, ViewChild, ElementRef } from "@angular/core";
import * as toastr from "toastr";
import { EditorService } from "../../../services/editor.service";
import { NgRedux, select } from "@angular-redux/store";
import { MetabolightsService } from "../../../services/metabolights/metabolights.service";
import { environment } from "src/environments/environment";
import { FtpManagementService } from "src/app/services/ftp-management.service";
import { FTPResponse } from "src/app/models/mtbl/mtbls/interfaces/generics/ftp-response.interface";
import { subscribeOn } from "rxjs-compat/operator/subscribeOn";
import { interval, Observable, of } from "rxjs";
import { delay, mergeMap, tap } from "rxjs/operators";
import { E } from "@angular/cdk/keycodes";


const CalculationStatus = {
  NO_TASK: 'Nothing to do',
  UNKNOWN: 'Status unknown, potential error',
  SYNC_NEEDED: 'New files to be synchronised',
  SYNC_NOT_NEEDED: 'No new files to synchronise',
  CALCULATING: 'Scanning...'
}

@Component({
  selector: "mtbls-files",
  templateUrl: "./files.component.html",
  styleUrls: ["./files.component.css"],
})
export class FilesComponent implements OnInit, OnDestroy,  OnChanges {
  @select((state) => state.study.readonly) readonly;
  @select((state) => state.study.status) studyStatus;
  @select((state) => state.status.isCurator) isCurator;
  @select((state) => state.study.identifier) studyIdentifier: any;
  @Input("validations") validations: any;

  containerHeight: any = 279;

  rawFiles: any[] = [];
  metaFiles: any[] = [];
  auditFiles: any[] = [];
  derivedFiles: any[] = [];
  uploadFiles: any[] = [];
  filesLoading = false;
  rawFilesLoading = false;
  validationsId = "upload";

  filteredMetaFiles: any[] = [];
  filteredRawFiles: any[] = [];
  filteredAuditFiles: any[] = [];
  filteredDerivedFiles: any[] = [];
  filteredUploadFiles: any[] = [];

  selectedMetaFiles: any[] = [];
  selectedRawFiles: any[] = [];
  selectedAuditFiles: any[] = [];
  selectedDerivedFiles: any[] = [];
  selectedUploadFiles: any[] = [];

  isDeleteModalOpen = false;
  forceMetaDataDelete = false;

  selectedCategory: string = null;
  fileLocation: string = null;
  status: string = null;

  access: string = null;
  curator = false;

  requestedStudy: string = null;

  refreshingData = false;

  isReadOnly = false;

  // ftp ops response variables
  calculation: FTPResponse = {
    status: 'Loading',
    description: '...',
    last_update_time: '...'
  };
  ongoingStatus: FTPResponse = {
    status: 'UNKNOWN',
    description: '',
    last_update_time: 'N/A'
  };
  loadingResponse: FTPResponse = {
    status: 'LOADING',
    description: 'loading...',
    last_update_time: 'n/a'
  }

  syncButtonEnabled = false;
  syncButtonToolTipMessage = 'can only sync when new files found'

  isSyncing = false;
  isCalculating = false;

  intervalSub = interval(2000);
  calcInterval = interval(20000)

  constructor(
    private editorService: EditorService,
    private dataService: MetabolightsService,
    private ftpService: FtpManagementService
  ) {}

  ngOnInit() {
    this.loadFiles();
    this.loadAccess();
    if (!environment.isTesting) {
      this.setUpSubscriptions();
    }
    this.checkFTPFolder(false, true)

    let syncStatusSub = this.ftpService.getSyncStatus()
    .subscribe(statusRes => {
      this.ongoingStatus = statusRes
      syncStatusSub.unsubscribe();
    })
  }

  ngOnChanges(changes) {
  }



  ngOnDestroy(): void {
      // kill all subs somehow
  }

  setUpSubscriptions() {
    this.readonly.subscribe((value) => {
      if (value !== null) {
        this.isReadOnly = value;
      }
    });
    this.studyStatus.subscribe((value) => {
      this.status = value;
    });
    this.studyIdentifier.subscribe((value) => {
      this.requestedStudy = value;
    });
    this.isCurator.subscribe((value) => {
      if (value !== null) {
        this.curator = value;
      }
    });
  }

  changeforceMetaDataDeleteValue(event) {
    this.forceMetaDataDelete = event.currentTarget.checked;
  }

  openDeleteConfirmation(category, fLocation) {
    this.forceMetaDataDelete = false;
    this.selectedCategory = category;
    this.fileLocation = fLocation;
    this.isDeleteModalOpen = true;
  }

  closeDeleteConfirmation() {
    this.isDeleteModalOpen = false;
  }

  selectedDownloadFiles() {
    if (this.selectedMetaFiles.length > 0) {
      let files = "";
      this.selectedMetaFiles.forEach((f) => {
        if (files === "") {
          files = f.file;
        } else {
          files = files + "," + f.file;
        }
      });
      return files;
    } else {
      return "metadata";
    }
  }

  deleteSelected() {
    if (this.selectedCategory !== null) {
      if (this.selectedCategory === "meta") {
        this.executeDelete(this.selectedMetaFiles);
      } else if (this.selectedCategory === "audit") {
        this.executeDelete(this.selectedAuditFiles);
      } else if (this.selectedCategory === "derived") {
        this.executeDelete(this.selectedDerivedFiles);
      } else if (this.selectedCategory === "upload") {
        this.executeDelete(this.selectedUploadFiles);
      } else if (this.selectedCategory === "raw") {
        this.executeDelete(this.selectedRawFiles);
      }
    }
  }

  resetData() {
    this.filteredMetaFiles = [];
    this.filteredRawFiles = [];
    this.filteredAuditFiles = [];
    this.filteredDerivedFiles = [];
    this.filteredUploadFiles = [];

    this.selectedMetaFiles = [];
    this.selectedRawFiles = [];
    this.selectedAuditFiles = [];
    this.selectedDerivedFiles = [];
    this.selectedUploadFiles = [];
  }

  executeDelete(files) {
    this.editorService
      .deleteStudyFiles(
        null,
        this.compileBody(files),
        this.fileLocation,
        this.forceMetaDataDelete
      )
      .subscribe((data) => {
        this.closeDeleteConfirmation();
        toastr.success("File(s) deleted successfully", "Success", {
          timeOut: "2500",
          positionClass: "toast-top-center",
          preventDuplicates: true,
          extendedTimeOut: 0,
          tapToDismiss: false,
        });
        this.loadFilesPassively();
      });
  }

  compileBody(filesList) {
    const files = [];
    filesList.forEach((f) => {
      files.push({ name: f.file });
    });
    return { files };
  }

  selectFiles(event, category, file, includeAll) {
    if (includeAll) {
      if (event.currentTarget.checked) {
        if (category === "raw") {
          this.selectedRawFiles = this.filteredRawFiles.slice();
        } else if (category === "audit") {
          this.selectedAuditFiles = this.filteredAuditFiles.slice();
        } else if (category === "derived") {
          this.selectedDerivedFiles = this.filteredDerivedFiles.slice();
        } else if (category === "upload") {
          this.selectedUploadFiles = this.filteredUploadFiles.slice();
        } else if (category === "meta") {
          this.selectedMetaFiles = this.filteredMetaFiles.slice();
        }
      } else {
        if (category === "raw") {
          this.selectedRawFiles = [];
        } else if (category === "audit") {
          this.selectedAuditFiles = [];
        } else if (category === "derived") {
          this.selectedDerivedFiles = [];
        } else if (category === "upload") {
          this.selectedUploadFiles = [];
        } else if (category === "meta") {
          this.selectedMetaFiles = [];
        }
      }
    } else {
      if (event.currentTarget.checked) {
        if (category === "raw") {
          this.selectedRawFiles = this.selectedRawFiles.concat(
            this.filteredRawFiles.filter((f) => f.file === file.file)
          );
        } else if (category === "audit") {
          this.selectedAuditFiles = this.selectedAuditFiles.concat(
            this.filteredAuditFiles.filter((f) => f.file === file.file)
          );
        } else if (category === "derived") {
          this.selectedDerivedFiles = this.selectedDerivedFiles.concat(
            this.filteredDerivedFiles.filter((f) => f.file === file.file)
          );
        } else if (category === "upload") {
          this.selectedUploadFiles = this.selectedUploadFiles.concat(
            this.filteredUploadFiles.filter((f) => f.file === file.file)
          );
        } else if (category === "meta") {
          this.selectedMetaFiles = this.selectedMetaFiles.concat(
            this.filteredMetaFiles.filter((f) => f.file === file.file)
          );
        }
      } else {
        if (category === "raw") {
          const selectedFileNames = this.selectedRawFiles.map((r) => r.file);
          const indexOfSelectedFileName = selectedFileNames.indexOf(file.file);
          if (indexOfSelectedFileName > -1) {
            this.selectedRawFiles.splice(indexOfSelectedFileName, 1);
          }
        } else if (category === "audit") {
          const selectedFileNames = this.selectedAuditFiles.map((r) => r.file);
          const indexOfSelectedFileName = selectedFileNames.indexOf(file.file);
          if (indexOfSelectedFileName > -1) {
            this.selectedAuditFiles.splice(indexOfSelectedFileName, 1);
          }
        } else if (category === "derived") {
          const selectedFileNames = this.selectedDerivedFiles.map(
            (r) => r.file
          );
          const indexOfSelectedFileName = selectedFileNames.indexOf(file.file);
          if (indexOfSelectedFileName > -1) {
            this.selectedDerivedFiles.splice(indexOfSelectedFileName, 1);
          }
        } else if (category === "upload") {
          const selectedFileNames =
            this.selectedUploadFiles.length > 0
              ? this.selectedUploadFiles.map((r) => r.file)
              : [];
          if (selectedFileNames) {
            const indexOfSelectedFileName = selectedFileNames.indexOf(
              file.file
            );
            if (indexOfSelectedFileName > -1) {
              this.selectedUploadFiles.splice(indexOfSelectedFileName, 1);
            }
          }
        } else if (category === "meta") {
          const selectedFileNames = this.selectedMetaFiles.map((r) => r.file);
          const indexOfSelectedFileName = selectedFileNames.indexOf(file.file);
          if (indexOfSelectedFileName > -1) {
            this.selectedMetaFiles.splice(indexOfSelectedFileName, 1);
          }
        }
      }
    }
  }

  decompresssFiles(files) {
    const body = { files: [] };
    files.forEach((file) => {
      if (file.type === "compressed") {
        body.files.push({ name: file.file });
      }
    });

    const fileNames = body.files.map((file) => file.name).join(", ");

    if (body.files.length > 0) {
      this.editorService.decompressFiles(body).subscribe((response) => {
        toastr.success(
          "Job submitted - Started decompressing files (" + fileNames + ")",
          "Success",
          {
            timeOut: "2500",
            positionClass: "toast-top-center",
            preventDuplicates: true,
            extendedTimeOut: 0,
            tapToDismiss: true,
          }
        );
        this.loadFilesPassively();
      });
    }
  }

  containsZipFiles(files) {
    let contains = false;
    files.forEach((file) => {
      if (file.type === "compressed") {
        contains = true;
      }
    });
    return contains;
  }

  isChecked(filename, category) {
    let isFileChecked = false;
    if (category === "raw") {
      this.selectedRawFiles.forEach((f) => {
        if (f.file === filename) {
          isFileChecked = true;
        }
      });
    } else if (category === "audit") {
      this.selectedAuditFiles.forEach((f) => {
        if (f.file === filename) {
          isFileChecked = true;
        }
      });
    } else if (category === "derived") {
      this.selectedDerivedFiles.forEach((f) => {
        if (f.file === filename) {
          isFileChecked = true;
        }
      });
    } else if (category === "upload") {
      this.selectedUploadFiles.forEach((f) => {
        if (f.file === filename) {
          isFileChecked = true;
        }
      });
    } else if (category === "meta") {
      this.selectedMetaFiles.forEach((f) => {
        if (f.file === filename) {
          isFileChecked = true;
        }
      });
    }
    return isFileChecked;
  }

  loadFilesPassively() {
    this.refreshingData = true;
    this.loadFiles();
  }

  loadFiles() {
    this.resetData();
    this.filesLoading = true;
    this.rawFilesLoading = true;
    this.refreshingData = true;

    this.passiveUpdate();
  }

  loadAccess() {
    this.editorService.getStudyPrivateFolderAccess().subscribe(
      (data) => {
        this.access = data.Access;
      },
      (error) => {
        console.log(error);
      }
    );
  }

  toggleFolderAccess() {
    this.editorService.toggleFolderAccess().subscribe(
      (data) => {
        this.access = data.Access;
      },
      (error) => {
        console.log(error);
      }
    );
  }

  passiveUpdate() {
    this.dataService.getStudyFilesFetch(true).subscribe(
      (data) => {
        this.sortFiles(data);
      },
      (error) => {
        this.editorService
          .getStudyFilesList(null, null, null)
          .subscribe((data) => {
            this.sortFiles(data);
          });
      }
    );
  }

  sortFiles(data) {
    this.rawFiles = [];
    this.metaFiles = [];
    this.auditFiles = [];
    this.derivedFiles = [];
    this.uploadFiles = data.latest;
    this.filteredUploadFiles = this.uploadFiles;
    this.filesLoading = false;
    this.refreshingData = false;

    data.study?.forEach((file) => {
      if (
        file.type === "raw" ||
        file.type === "unknown" ||
        file.type === "compressed" ||
        file.type === "derived"
      ) {
        this.rawFiles.push(file);
        this.filteredRawFiles.push(file);
      } else if (file.type.indexOf("metadata") > -1) {
        this.metaFiles.push(file);
        this.filteredMetaFiles.push(file);
      } else if (file.type === "audit") {
        this.auditFiles.push(file);
        this.filteredAuditFiles.push(file);
      } else if (
        file.type === "internal_mapping" ||
        file.type === "spreadsheet"
      ) {
        this.derivedFiles.push(file);
        this.filteredDerivedFiles.push(file);
      } else {
        this.rawFiles.push(file);
        this.filteredRawFiles.push(file);
      }
    });
    this.rawFilesLoading = false;
  }

  applyFilter(event, target) {
    const term = event.target.value;
    if (target === "meta") {
      this.filteredMetaFiles = this.aFilter(term, this.metaFiles);
    } else if (target === "audit") {
      this.filteredAuditFiles = this.aFilter(term, this.auditFiles);
    } else if (target === "raw") {
      this.filteredRawFiles = this.aFilter(term, this.rawFiles);
    } else if (target === "derived") {
      this.filteredDerivedFiles = this.aFilter(term, this.derivedFiles);
    } else if (target === "upload") {
      this.filteredUploadFiles = this.aFilter(term, this.uploadFiles);
    }
  }

  aFilter(term, source) {
    let target = [];
    if (term === "") {
      target = source;
      return target;
    } else {
      target = source.filter(
        (t) => t.file.toLowerCase().indexOf(term.toLowerCase()) > -1
      );
      return target;
    }
  }

  copyFiles() {
    this.editorService
      .syncFiles({
        files: [],
      })
      .subscribe((data) => {
        toastr.success("Files synced successfully", "Success", {
          timeOut: "2500",
          positionClass: "toast-top-center",
          preventDuplicates: true,
          extendedTimeOut: 0,
          tapToDismiss: false,
        });
      });
  }

  isFolder(file) {
    return file.directory;
  }

  /**
   * Handler for ftp-management component check button event emitter.
   * @param $event - angular event object.
   */
  handleCheckClick($event): void {
    this.checkFTPFolder(true, false);
  }

  /**
   * Handler for ftp-management component sync button event emitter.
   * @param $event - angular event object.
   */
  handleSyncClick($event): void {
    this.sync();
  }

  /**
   * Checks the FTP folder to see if there are any new uploads. This initiates a 'calculation' process
   * within the FTP infrastructure, and can take anywhere from a few seconds to a few minutes.
   * It calls the ftp service method syncCalculation once with the force flag set to true, to instruct the
   *  API to initiate a new calculation process. Any subsequent calls are made with the force flag set to false
   * so that it does not initiate a new process while one is underway.
   * It will keep making the call to the API to check the status of the calculation operation until it receives
   *  a status in the response that matches the 'accept' array below.
   * @param force
   */
  checkFTPFolder(force: boolean, init: boolean): void {
    const accept = ["NO_TASK", "SYNC_NEEDED", "SYNC_NOT_NEEDED", "UNKNOWN"]
    let sub = this.ftpService.syncCalculation(force)
    .subscribe(res => {
      this.isCalculating = true;
      if (accept.includes(res.status)) {
        this.calculation = res;
        this.isCalculating = false;
      } else {
        let calcsub = this.calcInterval.subscribe(x => {
          this.ftpService.syncCalculation(false).subscribe(ftpRes => {
            if(accept.includes(ftpRes.status)) {
              this.calculation = ftpRes
              this.isCalculating = false;
              calcsub.unsubscribe();
              if(init) { sub.unsubscribe();  }
            }
          })
        })
      }
    })
  }

  /**
   * Synchronise an FTP folder with a study folder.
   * This initiates the synchronisation process within the FTP infrastructure.
   * Owing to recent changes this operation is now asynchronous, and is queued
   * with specific EBI FTP helpers. It initiates the sync by calling the ftp service method
   * synchronise, and then repeatedly checks the status of the operation until it receives a
   * status from the 'accept' list below.
   */
  sync(): void {
    const accept = ["COMPLETED_SUCCESS", "SYNC_FAILURE", "START_FAILURE"]
    this.isSyncing = true;
    let temp = this.ongoingStatus.last_update_time
    this.ongoingStatus = this.loadingResponse;
    this.ongoingStatus.last_update_time = temp;
    this.ftpService.synchronise().subscribe(res => {
      // check the status every second or so
      let syncsub = this.intervalSub.subscribe(x => {
        if(!accept.includes(this.ongoingStatus.status)){
          this.checkSyncStatus();
        } else {
          // if the op was previously successful this will always be hit
          this.isSyncing = false;
          // setting this here instead of making an unncessary call
          this.calculation.status = 'NO_SYNC_NEEDED';
          syncsub.unsubscribe();
          this.editorService.loadStudyFiles(true);
          this.checkFTPFolder(true, false);
        }
      })
    })
  }

  /**
   * Checks the current status of a sync operation by calling the ftp service method getSyncStatus.
   */
  checkSyncStatus(): void {
    this.ftpService.getSyncStatus().subscribe(ftpRes => {
      console.log(ftpRes.status)
      this.ongoingStatus = ftpRes
    })
  }

  get validation() {
    return this.validations[this.validationsId];
  }
}
