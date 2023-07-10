import { Component, OnInit, Input } from "@angular/core";

@Component({
  selector: "mtbls-about",
  templateUrl: "./about.component.html",
  styleUrls: ["./about.component.css"],
})
export class AboutComponent implements OnInit {
  @Input("editorVersion") editorVersion: string;
  @Input("apiVersion") apiVersion: string;

  isModalOpen = false;


  ngOnInit() {
  }


  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }
}
