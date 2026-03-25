import { Component, OnInit, Input } from "@angular/core";
import { Ontology } from "../../../../models/mtbl/mtbls/common/mtbls-ontology";
import { EditorService } from "../../../../services/editor.service";
import * as toastr from "toastr";

@Component({
  selector: "ontology-details",
  templateUrl: "./ontology-details.component.html",
  styleUrls: ["./ontology-details.component.css"],
})
export class OntologyDetailsComponent implements OnInit {
  @Input("showOntologyDetail") showOntologyDetail: boolean = true;
  @Input(/*'value'*/) value: Ontology;
  details: any = null;
  isModalOpen = false;
  isLoading = false;

  constructor(private editorService: EditorService) {}

  ngOnInit() {}

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  getObjectKeys(ann) {
    return Object.keys(ann);
  }

  displayOntologyInfo() {
    if (!this.showOntologyDetail) {
      return
    }
    if (this.value && this.value.termSource && (this.value.termSource.name === 'MTBLS' || this.value.termSource.name === 'Metabolights')) {
      return;
    }
    this.isLoading = true;
    const value = Object.assign({}, this.value);
    this.editorService.getOntologyDetails(value).subscribe(
      (response) => {
        this.details = response;
        this.isLoading = false;
        this.openModal();
      },
      (error) => {
        this.isLoading = false;
        this.details = null;
        toastr.error("'" +value.annotationValue + "' ontology detail is not found", "Error", {
          timeOut: "3000",
          positionClass: "toast-top-center",
          preventDuplicates: true,
          extendedTimeOut: 0,
          tapToDismiss: false,
        });
      }
    );
  }
}
