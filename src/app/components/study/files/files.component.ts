import { Component, OnInit, Input, OnChanges, inject, AfterViewInit, ViewChild, ElementRef, HostListener } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { ConfigurationService } from "src/app/configuration.service";
import { httpOptions } from "src/app/services/headers";
import * as toastr from "toastr";
import { EditorService } from "../../../services/editor.service";
import { MetabolightsService } from "../../../services/metabolights/metabolights.service";
import { PlatformLocation } from '@angular/common';
import { StudyFile } from "src/app/models/mtbl/mtbls/interfaces/study-files.interface";
import { GeneralMetadataState } from "src/app/ngxs-store/study/general-metadata/general-metadata.state";
import { Store } from "@ngxs/store";
import { filter, Observable, timer } from "rxjs";
import { ApplicationState } from "src/app/ngxs-store/non-study/application/application.state";
import { UserState } from "src/app/ngxs-store/non-study/user/user.state";
import { GetGeneralMetadata } from "src/app/ngxs-store/study/general-metadata/general-metadata.actions";
import { SyncEvent } from "./rsync/rsync.component";
import { TransferHealthcheckService, TransferStatus } from "src/app/services/transfer-healthcheck.service";
import { SetTransferStatus } from "src/app/ngxs-store/non-study/application/application.actions";
import { FilesState } from "src/app/ngxs-store/study/files/files.state";
import { UploadComponent } from "../../shared/upload/upload.component";
declare let AW4: any;




@Component({
  selector: "mtbls-files",
  templateUrl: "./files.component.html",
  styleUrls: ["./files.component.css"],
})
export class FilesComponent implements OnInit,  OnChanges, AfterViewInit {

  studyIdentifier$: Observable<string> = inject(Store).select(GeneralMetadataState.id);
  studyStatus$: Observable<string> = inject(Store).select(GeneralMetadataState.status);
  readonly$: Observable<boolean> = inject(Store).select(ApplicationState.readonly);
  isCurator$: Observable<boolean> = inject(Store).select(UserState.isCurator);
  transferStatus$: Observable<TransferStatus> = inject(Store).select(ApplicationState.transferStatus)
  publicHttpUrl$: Observable<string> = inject(Store).select(GeneralMetadataState.publicHttpUrl);
  publicFtpUrl$: Observable<string> = inject(Store).select(GeneralMetadataState.publicFtpUrl);
  publicGlobusUrl$: Observable<string> = inject(Store).select(GeneralMetadataState.publicGlobusUrl);
  privateFtpAccessible$: Observable<boolean> = inject(Store).select(FilesState.privateFtpAccessible);
  obfuscationCode$: Observable<string> = inject(Store).select(FilesState.obfuscationCode);



  @Input("validations") validations: any;

  @ViewChild('downloadDropdown') dropdownRef!: ElementRef;
  @ViewChild('uploadDropdown') uploadDropdownRef!: ElementRef;
  @ViewChild('metadataUploadArea') metadataUploadArea!: ElementRef;
  @ViewChild('uploadComponent') uploadComponent!: UploadComponent;

  containerHeight: any = 279;

  rawFiles: any[] = [];
  metaFiles: any[] = [];
  resultFiles: any[] = [];
  auditFiles: any[] = [];
  derivedFiles: any[] = [];
  uploadFiles: any[] = [];

  ftpLocation = "upload";
  filesLoading = false;
  rawFilesLoading = false;
  validationsId = "upload";
  filteredMetaFiles: any[] = [];
  filteredResultFiles: any[] = [];
  filteredRawFiles: any[] = [];
  filteredAuditFiles: any[] = [];
  filteredDerivedFiles: any[] = [];
  filteredDerivedDataFiles: any[] = [];
  filteredUploadFiles: any[] = [];

  selectedMetaFiles: any[] = [];
  selectedResultFiles: any[] = [];
  selectedRawFiles: any[] = [];
  selectedAuditFiles: any[] = [];
  selectedDerivedFiles: any[] = [];
  selectedUploadFiles: any[] = [];

  isDeleteModalOpen = false;
  forceMetaDataDelete = false;
  isSyncEnabled = false;
  selectedCategory: string = null;
  fileLocation: string = null;
  status: string = null;
  privateFtpAccessible: boolean = true;
  baseHref: string;
  access: string = null;
  curator = false;
  publicHttpUrl: string = null;
  publicFtpUrl: string = null;
  publicGlobusUrl: string = null;
  obfuscationCode: string = null;

  requestedStudy: string = null;

  refreshingData = false;

  isReadOnly = false;
  MANAGED_FOLDERS = ['FILES', 'AUDIT_FILES', 'INTERNAL_FILES', 'ARCHIVED_AUDIT_FILES'];
  MANAGED_SUB_FOLDERS=['AUDIT_FILES/ARCHIVED_AUDIT_FILES', "INTERNAL_FILES/logs"];

  MIN_CONNECT_VERSION = "3.6.0.0";
  CONNECT_AUTOINSTALL_LOCATION = "//d3gcli72yxqn2z.cloudfront.net/connect/v4";
  asperaWeb: any = null;
  asperaStatus: any = "-";
  transferStatus: TransferStatus = null;

  isDownloadDropdownActive = false;
  isUploadDropdownActive = false;
  uploadShowBrowser = true;
  uploadBrowserFirst = false;
  isAsperaModalActive = false;
  isGlobusModalActive = false;



  constructor(
    private editorService: EditorService,
    private dataService: MetabolightsService,
    private platformLocation: PlatformLocation,
    private transferHealthcheckService: TransferHealthcheckService,
    private store: Store,
    private http: HttpClient,
    private configService: ConfigurationService
  ) {
    this.baseHref = this.platformLocation.getBaseHrefFromDOM();
  }

  ngOnInit() {
    this.loadFiles();

    this.setUpSubscriptionsNgxs();

  }

  ngAfterViewInit(): void {
    this.checkTransferStatus();

  }

  ngOnChanges(changes) {
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (this.isDownloadDropdownActive &&
        this.dropdownRef &&
        !this.dropdownRef.nativeElement.contains(event.target)) {
      this.isDownloadDropdownActive = false;
        }
    if (this.isUploadDropdownActive &&
        this.uploadDropdownRef &&
        !this.uploadDropdownRef.nativeElement.contains(event.target)) {
      this.isUploadDropdownActive = false;
        }

  }

  checkTransferStatus() {
    this.transferHealthcheckService.getHealthcheck().subscribe((response) => {
      this.store.dispatch(new SetTransferStatus(response.content.transferStatus));
    })

  }


  setUpSubscriptionsNgxs() {
    this.readonly$.subscribe((value) => {
      if (value !== null) {
        this.isReadOnly = value;
        this.updateSyncStatus();
      }
    });
    this.studyStatus$.subscribe((value) => {
      this.status = value;
      this.updateSyncStatus();
    });

    this.privateFtpAccessible$.subscribe((value) => {
      this.privateFtpAccessible = value;
    });
    this.studyIdentifier$.subscribe((value) => {
      this.requestedStudy = value;
    });
    this.isCurator$.subscribe((value) => {
      if (value !== null) {
        this.curator = value;
        this.updateSyncStatus();
      }
    });
    this.transferStatus$.pipe(filter(val => val.aspera.online !== null)).subscribe(
      (value) => {
        this.transferStatus = value;
      })
    this.publicHttpUrl$.pipe(filter(val => val !== null)).subscribe(
      (value) => {
        this.publicHttpUrl = value
      })
    this.publicFtpUrl$.pipe(filter(val => val !== null)).subscribe(
      (value) => {
        this.publicFtpUrl = value
      }
    )
    this.publicGlobusUrl$.pipe(filter(val => val !== null)).subscribe(
      (value) => {
        this.publicGlobusUrl = value;
      }
    )
    this.obfuscationCode$.subscribe((value) => {
      this.obfuscationCode = value;
    });
  }


  scrollToMetadataUpload() {
    if (this.metadataUploadArea) {
      this.metadataUploadArea.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  toggleDownloadDropdown() {
  this.isDownloadDropdownActive = !this.isDownloadDropdownActive;
}

toggleUploadDropdown() {
  this.isUploadDropdownActive = !this.isUploadDropdownActive;
}

openMetadataUpload() {
  this.isUploadDropdownActive = false;
  this.uploadShowBrowser = true;
  this.uploadBrowserFirst = true;
  this.uploadComponent.openUploadModal();
}

openDataUpload() {
  this.isUploadDropdownActive = false;
  this.uploadShowBrowser = false;
  this.uploadBrowserFirst = false;
  this.uploadComponent.openUploadModal();
}

downloadMetadata() {
  this.isDownloadDropdownActive = false;
  const files = [];

  this.metaFiles.forEach(f => files.push(f.file));
  this.resultFiles.forEach(f => files.push(f.file));

  if (files.length > 0) {
    const metadataFiles = files.join("|");
    this.downloadWithToken(metadataFiles);
  } else {
    toastr.error("No metadata files found to download.", "Error");
  }
}

async downloadWithToken(file: string) {
  let url = this.configService.config.metabolightsWSURL.baseURL + "/studies/" + this.requestedStudy + "/download";
  if (this.obfuscationCode) {
    url += "/" + this.obfuscationCode;
  }
  url += "?file=" + file;

  const oneTimeTokenUrl = this.configService.config.metabolightsWSURL.baseURL + "/auth/create-onetime-token";

  if (!this.status || this.status.trim() === "" || this.status.toLowerCase() === "provisional") {
    this.http.get<{ one_time_token: string }>(oneTimeTokenUrl, httpOptions).subscribe({
      next: (response) => {
        window.open(url + "&passcode=" + response.one_time_token, "_blank");
      },
      error: (err) => {
        toastr.error("Failed to create download link.", "Error");
      },
    });
  } else {
    window.open(url, "_blank");
  }
}


onAsperaDownload() {
  this.isAsperaModalActive = true;
}
closeAsperaModal() {
  this.isAsperaModalActive = false;
}

onGlobusDownload() {
  this.isGlobusModalActive = true;
}
closeGlobusModal() {
  this.isGlobusModalActive = false;
}

  getFolderStatus(){
    if (this.isReadOnly !== null && this.isReadOnly === false){
      this.loadAccess();
    }
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

  selectedDownloadFiles(category: string) {
    if (category === 'meta') {
      if (this.selectedMetaFiles.length > 0) {
        let files = "";
        this.selectedMetaFiles.forEach((f) => {
          if (files === "") {
            files = f.file;
          } else {
            files = files + "|" + f.file;
          }
        });
        return files;
      } else {
        return "metadata";
      }
    } else if (category === 'result') {
      if (this.selectedResultFiles.length > 0) {
        let files = "";
        this.selectedResultFiles.forEach((f) => {
          if (files === "") {
            files = f.file;
          } else {
            files = files + "|" + f.file;
          }
        });
        return files;
      } else {
        return "metadata";
      }
    }
  }

  deleteSelected() {
    if (this.selectedCategory !== null) {
      if (this.selectedCategory === "meta") {
        this.executeDelete(this.selectedMetaFiles, this.filteredMetaFiles, this.metaFiles);
      } else if (this.selectedCategory === "result") {
        this.executeDelete(this.selectedResultFiles, this.filteredResultFiles, this.resultFiles);
      } else if (this.selectedCategory === "audit") {
        this.executeDelete(this.selectedAuditFiles, this.filteredAuditFiles, this.auditFiles);
      } else if (this.selectedCategory === "derived") {
        this.executeDelete(this.selectedDerivedFiles, this.filteredDerivedFiles, this.derivedFiles);
      } else if (this.selectedCategory === "upload") {
        this.executeDelete(this.selectedUploadFiles, this.selectedUploadFiles, this.uploadFiles);
      } else if (this.selectedCategory === "raw") {
        this.executeDelete(this.selectedRawFiles, this.selectedRawFiles, this.rawFiles);
      }
    }
  }

  resetData() {
    this.filteredMetaFiles = [];
    this.filteredResultFiles = [];
    this.filteredRawFiles = [];
    this.filteredAuditFiles = [];
    this.filteredDerivedFiles = [];
    this.filteredUploadFiles = [];

    this.selectedMetaFiles = [];
    this.selectedResultFiles = [];
    this.selectedRawFiles = [];
    this.selectedAuditFiles = [];
    this.selectedDerivedFiles = [];
    this.selectedUploadFiles = [];
  }
  handleDeletedFile($event, allFiles, filteredFiles, selectedFiles){
    const key = $event.file;
    const index = selectedFiles.findIndex((e) => e.file === key.file);
    if (index >= 0){
      selectedFiles.splice(index, 1);
    }
    const filteredIndex = filteredFiles.findIndex((e) => e.file === key.file);
    if (filteredIndex >= 0){
      filteredFiles.splice(filteredIndex, 1);
    }
    const allFilesIndex = allFiles.findIndex((e) => e.file === key.file);
    if (allFilesIndex >= 0){
      allFiles.splice(allFilesIndex, 1);
    }
  }
  executeDelete(files, filteredFiles, allFiles) {
    this.editorService
      .deleteStudyFiles(
        null,
        this.compileBody(files),
        this.fileLocation,
        this.forceMetaDataDelete
      )
      .subscribe((data) => {
        this.closeDeleteConfirmation();
        data.deleted_files.forEach((key) => {
          const index = files.findIndex((e) => e.file === key.file);
          if (index >= 0){
            files.splice(index, 1);
          }
          const filteredIndex = filteredFiles.findIndex((e) => e.file === key.file);
          if (filteredIndex >= 0){
            filteredFiles.splice(filteredIndex, 1);
          }
          const allFilesIndex = allFiles.findIndex((e) => e.file === key.file);
          if (allFilesIndex >= 0){
            allFiles.splice(allFilesIndex, 1);
          }
        });
        if (data.errors.length === 0) {
          let message: string;
          if (data.deleted_files.length > 1) {
            message = "Selected "+ data.deleted_files.length +" files were deleted successfully";
          } else {
            message = "Selected file was deleted successfully";
          }
          toastr.success(message, "Success", {
            timeOut: "2500",
            positionClass: "toast-top-center",
            preventDuplicates: true,
            extendedTimeOut: 0,
            tapToDismiss: false,
          });
        } else {
          const failedFiles = [];
          for (const item of data.errors) {
            failedFiles.push(item.file);
          }
          toastr.error("File deletion has failed for : " + failedFiles.join(", "), "Error", {
            timeOut: "2500",
            positionClass: "toast-top-center",
            preventDuplicates: true,
            extendedTimeOut: 0,
            tapToDismiss: false,
          });
        }

        // this.loadFilesPassively();
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
        } else if (category === "result") {
          this.selectedResultFiles = this.filteredResultFiles.slice();
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
        } else if (category === "result") {
          this.selectedResultFiles = [];
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
        } else if (category === "result") {
          this.selectedResultFiles = this.selectedResultFiles.concat(
            this.filteredResultFiles.filter((f) => f.file === file.file)
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
        } else if (category === "result") {
          const selectedFileNames = this.selectedResultFiles.map((r) => r.file);
          const indexOfSelectedFileName = selectedFileNames.indexOf(file.file);
          if (indexOfSelectedFileName > -1) {
            this.selectedResultFiles.splice(indexOfSelectedFileName, 1);
          }
        }
      }
    }
  }

  decompressFiles(files) {
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
    } else if (category === "result") {
      this.selectedResultFiles.forEach((f) => {
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

  loadFiles(sync: boolean = false, syncEvent: SyncEvent = null) {
    this.resetData();
    sync ? this.filesLoading = false : this.filesLoading = true;
    this.rawFilesLoading = true;
    this.refreshingData = true;

    this.passiveUpdate(syncEvent);
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
  updateFileUpdateStatus() {
    return this.curator;
  }
  passiveUpdate(syncEvent) {
    if (syncEvent === SyncEvent.metadata) {
      this.store.dispatch(new GetGeneralMetadata(this.requestedStudy, this.isReadOnly))
    }
    this.dataService.getStudyFilesFetch(true, this.isReadOnly).subscribe(
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
    this.resultFiles = [];
    this.auditFiles = [];
    this.derivedFiles = [];
    this.filteredResultFiles = [];
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
        if (file.file.toLowerCase().endsWith(".maf") || (file.file.toLowerCase().startsWith("m_") && file.file.toLowerCase().endsWith(".tsv"))) {
          this.resultFiles.push(file);
          this.filteredResultFiles.push(file);
        } else {
          this.metaFiles.push(file);
          this.filteredMetaFiles.push(file);
        }
      } else if (file.type === "audit") {
        this.auditFiles.push(file);
        this.filteredAuditFiles.push(file);
      } else if (
        file.type === "internal_mapping" ||
        file.type === "spreadsheet"
      ) {
        this.derivedFiles.push(file);
        this.filteredDerivedFiles.push(file);
      } else if (
        file.type === "derived_data"
      ) {
        this.derivedFiles.push(file);
        this.filteredDerivedDataFiles.push(file);
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
    } else if (target === "result") {
      this.filteredResultFiles = this.aFilter(term, this.resultFiles);
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

  autoCollapsedFolder(file): boolean {
    return file.file === "FILES";
  }

  deletionEnabled(file: StudyFile): boolean {
    if (file.type === "audit" && this.curator == false) return false
    return !this.MANAGED_FOLDERS.includes(file.file);
  }

  deletionEnabledDebug(file: StudyFile): boolean {
  
    if (file.type === "audit" && this.curator == false) return false
    return !this.MANAGED_FOLDERS.includes(file.file);
  }

  downloadEnabled(file: StudyFile) {
    return !this.MANAGED_FOLDERS.includes(file.file) && !file.directory;
  }
  readonlyFolder(file: StudyFile) {
    return this.curator  ? false : file.directory && file.file.startsWith("INTERNAL_FILES");
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

  getManagedSubFolders(){
    return this.MANAGED_SUB_FOLDERS;
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

  get validation() {
    return this.validations[this.validationsId];
  }

  onFilesSynchronized($event: SyncEvent): void {
    this.loadFiles(true, $event);
  }
  updateSyncStatus() {
    this.isSyncEnabled = false;
    if (this.curator || (!this.isReadOnly && this.status && this.status.toUpperCase() == "PROVISIONAL")) {
      this.isSyncEnabled = true;
    }
  }

  onUploadComplete(event: any) {
    // Reload general metadata (ISA files may affect study metadata)
    this.store.dispatch(new GetGeneralMetadata(this.requestedStudy, this.isReadOnly)).subscribe(() => {
      // Reload file list after metadata update
      this.editorService
        .getStudyFilesList(this.requestedStudy, null, null)
        .subscribe((data) => {
          this.sortUniqueFiles(data);
        });
    });
  }
  sortUniqueFiles(data) {
  // Clear main arrays
  this.rawFiles = [];
  this.metaFiles = [];
  this.resultFiles = [];
  this.auditFiles = [];
  this.derivedFiles = [];
  this.uploadFiles = data.latest;
  this.filteredUploadFiles = this.uploadFiles;
  this.filesLoading = false;
  this.refreshingData = false;

  // Clear filtered arrays to avoid duplicates
  this.filteredRawFiles = [];
  this.filteredMetaFiles = [];
  this.filteredResultFiles = [];
  this.filteredAuditFiles = [];
  this.filteredDerivedFiles = [];
  this.filteredDerivedDataFiles = [];

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
      if (file.file.toLowerCase().endsWith(".maf") || (file.file.toLowerCase().startsWith("m_") && file.file.toLowerCase().endsWith(".tsv"))) {
        this.resultFiles.push(file);
        this.filteredResultFiles.push(file);
      } else {
        this.metaFiles.push(file);
        this.filteredMetaFiles.push(file);
      }
    } else if (file.type === "audit") {
      this.auditFiles.push(file);
      this.filteredAuditFiles.push(file);
    } else if (
      file.type === "internal_mapping" ||
      file.type === "spreadsheet"
    ) {
      this.derivedFiles.push(file);
      this.filteredDerivedFiles.push(file);
    } else if (file.type === "derived_data") {
      this.derivedFiles.push(file);
      this.filteredDerivedDataFiles.push(file);
    } else {
      this.rawFiles.push(file);
      this.filteredRawFiles.push(file);
    }
  });

  this.rawFilesLoading = false;
}
}


