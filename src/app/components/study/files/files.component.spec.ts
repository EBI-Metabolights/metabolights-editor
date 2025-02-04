import {} from "@angular/common/http/testing";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { of } from "rxjs";
import { EditorService } from "src/app/services/editor.service";
import { MockEditorService } from "src/app/services/editor.service.mock";
import { FtpManagementService } from "src/app/services/ftp-management.service";
import { MockFtpManagementService } from "src/app/services/ftp-management.service.mock";
import { MetabolightsService } from "src/app/services/metabolights/metabolights.service";
import { MockMetabolightsService } from "src/app/services/metabolights/metabolights.service.mock";

import { FilesComponent } from "./files.component";

describe("FilesComponent", () => {
  let component: FilesComponent;
  let fixture: ComponentFixture<FilesComponent>;
  let editorService: EditorService;
  let dataService: MetabolightsService;
  let ftpService: FtpManagementService;



  beforeEach(() => {
    editorService = TestBed.inject(EditorService);
    dataService = TestBed.inject(MetabolightsService);
    ftpService = TestBed.inject(FtpManagementService);
    fixture = TestBed.createComponent(FilesComponent);
    component = fixture.componentInstance;
    spyOn(component, "loadAccess").and.stub();
    component.uploadFiles = ["files"];

    fixture.detectChanges();
  });



  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
