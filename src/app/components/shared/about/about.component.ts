import { Component, OnInit, Input, Output } from "@angular/core";

@Component({
    selector: "mtbls-about",
    templateUrl: "./about.component.html",
    styleUrls: ["./about.component.css"],
    standalone: false
})
export class AboutComponent implements OnInit {
  @Input("editorVersion") editorVersion: string;
  @Input("apiVersion") apiVersion: string;
  @Input("isModalOpen") isModalOpen: boolean = false;
  
  ngOnInit() {
  }


  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }
}
