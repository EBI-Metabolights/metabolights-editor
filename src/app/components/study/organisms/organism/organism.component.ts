import { Component, OnInit, Input } from "@angular/core";

@Component({
  selector: "mtbls-organism",
  templateUrl: "./organism.component.html",
  styleUrls: ["./organism.component.css"],
})
export class OrganismComponent implements OnInit {
  @Input("value") organism: any;
  isModalOpen = false;

  constructor() {}

  ngOnInit() {
    this.organism.variants = this.organism.variants.filter((n) => n);
    this.organism.parts = this.organism.parts.filter((n) => n);
  }

  showModal() {
    if (this.organism.parts.length > 0 || this.organism.variants.length > 0) {
      this.isModalOpen = true;
    }
  }

  closeModal() {
    this.isModalOpen = false;
  }
}
