import { Component, OnInit, inject } from "@angular/core";
import { Store } from "@ngxs/store";
import { Observable } from "rxjs";
import { Owner } from "src/app/ngxs-store/non-study/user/user.actions";
import { UserState } from "src/app/ngxs-store/non-study/user/user.state";
import { GeneralMetadataState } from "src/app/ngxs-store/study/general-metadata/general-metadata.state";
import { FilesService } from "src/app/services/decomposed/files.service";
import * as toastr from "toastr";

@Component({
  selector: "mtbls-upload-globus",
  templateUrl: "./globus.component.html",
  styleUrls: ["./globus.component.css"],
})
export class GlobusUploadComponent implements OnInit {
  user$: Observable<Owner> = inject(Store).select(UserState.user);
  studyIdentifier$: Observable<string> = inject(Store).select(GeneralMetadataState.id);

  user: Owner = null;
  studyId: string = null;

  permissionStatus: 'enabled' | 'disabled' | 'loading' = 'loading';
  globusPermissions: any = null;

  constructor(
    private filesService: FilesService
  ) {}

  ngOnInit() {
    this.user$.subscribe((user) => {
      this.user = user;
    });

    this.studyIdentifier$.subscribe((id) => {
      if (id && id !== this.studyId) {
        this.studyId = id;
        this.fetchGlobusPermissions();
      }
    });
  }

  fetchGlobusPermissions() {
    if (!this.studyId) return;
    this.permissionStatus = 'loading';
    this.filesService.getGlobusPermissions(this.studyId).subscribe(
      (response: any) => {
        if (response && response.content && response.content.length > 0) {
          this.permissionStatus = 'enabled';
          this.globusPermissions = response.content[0].permissions[0];
        } else {
          this.permissionStatus = 'disabled';
          this.globusPermissions = null;
        }
      },
      (error) => {
        this.permissionStatus = 'disabled';
        this.globusPermissions = null;
        console.error("Error fetching Globus permissions", error);
      }
    );
  }

  togglePermission(event?: any) {
    if (this.permissionStatus === 'loading') return;

    if (this.permissionStatus === 'enabled') {
      this.permissionStatus = 'loading';
      this.filesService.disableGlobusPermissions(this.studyId).subscribe(
        () => {
          this.fetchGlobusPermissions();
        },
        (error) => {
          toastr.error("Failed to disable Globus permission.", "Error");
          this.fetchGlobusPermissions(); // refresh state
        }
      );
    } else {
      this.permissionStatus = 'loading';
      const username = this.user?.globus_username;
      
      if (!username) {
        toastr.error("No Globus username provided. Please update your profile.", "Error");
        this.permissionStatus = 'disabled';
        return;
      }

      this.filesService.enableGlobusPermissions(this.studyId).subscribe(
        () => {
          this.fetchGlobusPermissions();
        },
        (error) => {
          toastr.error("Failed to enable Globus permission.", "Error");
          this.fetchGlobusPermissions(); // refresh state
        }
      );
    }
  }

  copyToClipboard(val: string) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(val).then(() => {
        toastr.success("Copied to clipboard!");
      });
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = val;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("Copy");
      textArea.remove();
      toastr.success("Copied to clipboard!");
    }
  }
}
