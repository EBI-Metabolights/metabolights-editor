import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { EditorService } from "../../../services/editor.service";
import * as toastr from "toastr";
import { environment } from "src/environments/environment";
import { PlatformLocation } from "@angular/common";
import { Store } from "@ngxs/store";
import { Loading } from "src/app/ngxs-store/non-study/transitions/transitions.actions";

@Component({
  selector: "app-create",
  templateUrl: "./create.component.html",
  styleUrls: ["./create.component.css"],
})
export class CreateComponent implements OnInit {
  selectedCreateOption = 2;
  currentSubStep = 0;
  newStudy = "MTBLS1";
  options: any[] = [
    {
      text: "Yes, I would like to upload files now",
      value: 1,
      disabled: false,
    },
    {
      text: "I will upload files later",
      value: 2,
      disabled: false,
    },
  ];
  isLoading = false;
  baseHref: string;
  constructor(
    private editorService: EditorService,
    private router: Router,
    private store: Store,
    private platformLocation: PlatformLocation
  ) {
    this.editorService.initialiseStudy(null);
    this.baseHref = this.platformLocation.getBaseHrefFromDOM();
  }

  ngOnInit() {
    this.store.dispatch(new Loading.Disable())
    
  }

  nextSubStep() {
    this.currentSubStep = this.currentSubStep + 1;
  }

  createStudy() {
    this.isLoading = true;
    this.editorService.createStudy().subscribe(
      (res) => {
        this.currentSubStep = 3;
        this.newStudy = res.new_study;
        this.isLoading = false;
      },
      (err) => {
        toastr.error("Study creation error.", "Error", {
          timeOut: "2500",
          positionClass: "toast-top-center",
          preventDuplicates: true,
          extendedTimeOut: 0,
          tapToDismiss: true,
        });
        this.isLoading = false;
      }
    );
  }

  proceedToNextStep() {
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
      if (this.selectedCreateOption === 1) {
        this.router.navigate(["/guide/upload", this.newStudy]);
      } else {
        this.router.navigate(["/guide/meta", this.newStudy]);
      }
    }, 3000);
  }
}
