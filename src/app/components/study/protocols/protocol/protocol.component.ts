import { Component, OnInit, Input, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { EditorService } from "../../../../services/editor.service";
import {
  MTBLSProtocol,
  ProtocolParameter,
} from "./../../../../models/mtbl/mtbls/mtbls-protocol";
import { Ontology } from "./../../../../models/mtbl/mtbls/common/mtbls-ontology";

import { IAppState } from "../../../../store";
import { NgRedux, select } from "@angular-redux/store";
import { ValidateRules } from "./protocol.validator";
import { OntologyComponent } from "../../../shared/ontology/ontology.component";
import * as toastr from "toastr";
import { JsonConvert } from "json2typescript";
import { IProtocol } from "src/app/models/mtbl/mtbls/interfaces/protocol.interface";
import { environment } from "src/environments/environment";

@Component({
  selector: "mtbls-protocol",
  templateUrl: "./protocol.component.html",
  styleUrls: ["./protocol.component.css"],
})
export class ProtocolComponent implements OnInit {
  @Input("value") protocol: any;
  @Input("required") required = false;
  @Input("validations") validations: any;

  @select((state) => state.study.readonly) studyReadonly;

  @ViewChild(OntologyComponent) parameterName: OntologyComponent;

  @select((state) => state.study.isProtocolsExpanded) isProtocolsExpanded;

  isStudyReadOnly = false;
  isModalOpen = false;
  isBulkEditModalOpen = false;
  isDeleteModalOpen = false;
  isParameterModalOpen = false;
  isFormBusy = false;
  isSymbolDropdownActive = false;

  editor: any;

  selectedProtocol: any = null;

  addNewProtocol = false;
  caretPos = 0;

  expand = true;

  form: FormGroup;

  validationsId = "protocols.protocol";

  constructor(
    private fb: FormBuilder,
    private editorService: EditorService,
    private ngRedux: NgRedux<IAppState>
  ) {
    if (!environment.isTesting) {
      this.setUpSubscriptions();
    }
  }

  setUpSubscriptions() {
    this.isProtocolsExpanded.subscribe((value) => {
      this.expand = !value;
    });

    this.studyReadonly.subscribe((value) => {
      if (value !== null) {
        this.isStudyReadOnly = value;
      }
    });
  }

  toggleExpand() {
    this.expand = !this.expand;
  }

  saveColumnValue(col, assay) {
    const columns = [];
    const column = {
      name: "",
      value: "",
      index: null,
    };
    if (col.isOntology) {
      column.value = col.values[0][0].annotationValue;
      column.index = col.index;
      column.name = col.name;
      columns.push(column);
      const ontSrc = {
        name: col.ontologyDetails.ref,
        value: col.values[0][0].termSource.name,
        index: col.index + 1,
      };
      columns.push(ontSrc);
      const ontAcc = {
        name: col.ontologyDetails.accession,
        value: col.values[0][0].termAccession,
        index: col.index + 2,
      };
      columns.push(ontAcc);
    } else {
      column.value = col.values[0];
      column.index = col.index;
      column.name = col.name;
      columns.push(column);
    }
    this.editorService
      .addColumns(assay, { data: columns }, "assays", null)
      .subscribe(
        (res) => {
          toastr.success("Assay specifications updated.", "Success", {
            timeOut: "2500",
            positionClass: "toast-top-center",
            preventDuplicates: true,
            extendedTimeOut: 0,
            tapToDismiss: false,
          });
        },
        (err) => {
          console.log(err);
        }
      );
  }

  formatTitle(term) {
    const s = term
      .replace(/_/g, " ")
      .replace(/\.[^/.]+$/, "")
      .replace(/\[/g, " - ")
      .replace(/\]/g, "");
    return s[0].toUpperCase() + s.slice(1);
  }

  hasAllSectionsEmpty() {
    let isEmpty = true;
    this.getAssaysWithProtocol().forEach((assay) => {
      this.protocol.meta[assay].forEach((col) => {
        if (!col["is-hidden"]) {
          isEmpty = false;
        }
      });
    });
    return isEmpty;
  }

  hasAssaySectionsEmpty(assay) {
    let isEmpty = true;
    this.protocol.meta[assay].forEach((col) => {
      if (!col["is-hidden"]) {
        isEmpty = false;
      }
    });
    return isEmpty;
  }

  setEditor(editor: any) {
    this.editor = editor;
    this.editor.clipboard.addMatcher(Node.ELEMENT_NODE, (node, delta) => {
      const ops = [];
      delta.ops.forEach((op) => {
        if (op.insert && typeof op.insert === "string") {
          ops.push({
            insert: op.insert,
          });
        }
      });
      delta.ops = ops;
      return delta;
    });
  }

  toggleBulkEditSection() {
    this.isBulkEditModalOpen = !this.isBulkEditModalOpen;
  }

  toggleSymbolDropdown() {
    this.isSymbolDropdownActive = !this.isSymbolDropdownActive;
  }

  addSymbol(content) {
    this.editor.focus();
    const caretPosition = this.editor.getSelection(true);
    this.editor.insertText(caretPosition, content, "user");
    this.toggleSymbolDropdown();
  }

  getAssaysWithProtocol() {
    return Object.keys(this.protocol.meta);
  }

  copyToClipboard(item) {
    document.addEventListener("copy", (e: ClipboardEvent) => {
      e.clipboardData.setData("text/plain", item);
      e.preventDefault();
      document.removeEventListener("copy", null);
    });
    document.execCommand("copy");
    toastr.success("", "Copied symbol " + item + " to clipboard", {
      timeOut: "0",
      positionClass: "toast-top-center",
      preventDuplicates: true,
      extendedTimeOut: 0,
    });
  }

  ngOnInit() {
    if (this.protocol == null) {
      this.addNewProtocol = true;
    }
  }

  clearFormatting(target) {
    this.setFieldValue(target, this.strip(this.getFieldValue(target)));
  }

  strip(html) {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  }

  confirmDelete() {
    this.isModalOpen = false;
    this.isDeleteModalOpen = true;
  }

  closeDelete() {
    this.isDeleteModalOpen = false;
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.form.removeControl("description");
  }

  openParameterModal() {
    this.parameterName.values = [];
    this.isParameterModalOpen = true;
  }

  closeParameterModal() {
    this.isParameterModalOpen = false;
  }

  deleteParameter(parameter) {
    const filteredParameters = this.form
      .get("parameters")
      .value.filter(
        (obj) =>
          obj.parameterName.annotationValue !==
          parameter.parameterName.annotationValue
      );
    if (filteredParameters) {
      this.form.get("parameters").setValue(filteredParameters);
      this.form.markAsDirty();
    }
  }

  addParameter() {
    const parameter = new ProtocolParameter();
    parameter.parameterName = this.parameterName.values[0];
    if (
      this.form.get("parameters").value.length === 1 &&
      this.form.get("parameters").value[0].parameterName.annotationValue === ""
    ) {
      this.form.get("parameters").setValue([parameter]);
    } else if (
      this.form.get("parameters").value.length === 1 &&
      this.form.get("parameters").value[0].parameterName.annotationValue !== ""
    ) {
      this.form
        .get("parameters")
        .setValue(this.form.get("parameters").value.concat(parameter));
    } else if (this.form.get("parameters").value.length > 1) {
      this.form
        .get("parameters")
        .setValue(this.form.get("parameters").value.concat(parameter));
    } else {
      this.form.get("parameters").setValue([parameter]);
    }
    this.isParameterModalOpen = false;
    this.form.markAsDirty();
  }

  save() {
    if (!this.isStudyReadOnly) {
      if (this.getFieldValue("description")) {
        this.isFormBusy = true;
        if (!this.addNewProtocol) {
          this.editorService
            .updateProtocol(this.protocol.name, this.compileBody())
            .subscribe(
              (res) => {
                this.updateProtocols(res, "Protocol updated.");
                this.form.removeControl("description");
                // this.isModalOpen = false;
              },
              (err) => {
                this.isFormBusy = false;
              }
            );
        } else {
          this.editorService.saveProtocol(this.compileBody()).subscribe(
            (res) => {
              this.updateProtocols(res, "Protocol saved.");
              this.form.removeControl("description");
              this.isModalOpen = false;
            },
            (err) => {
              this.isFormBusy = false;
            }
          );
        }
      } else {
        alert("Protocol description cannot be empty");
      }
    }
  }

  delete() {
    if (!this.isStudyReadOnly) {
      if (!this.required) {
        this.editorService.deleteProtocol(this.protocol.name).subscribe(
          (res) => {
            this.addNewProtocol = true;
            this.updateProtocols(res, "Protocol deleted.");
            this.form.removeControl("description");
            this.isDeleteModalOpen = false;
            this.isModalOpen = false;
          },
          (err) => {
            this.isFormBusy = false;
          }
        );
      } else {
        toastr.error("Cannot delete a default protocol", "Error", {
          timeOut: "2500",
          positionClass: "toast-top-center",
          preventDuplicates: true,
          extendedTimeOut: 0,
          tapToDismiss: false,
        });
      }
    }
  }

  initialiseForm() {
    this.isFormBusy = false;
    this.form = null;
    if (this.protocol == null) {
      const mtblsProtocol = new MTBLSProtocol();
      mtblsProtocol.parameters = [];
      this.protocol = mtblsProtocol;
    }
    this.form = this.fb.group({
      name: [
        { value: this.protocol.name, disabled: this.required },
        ValidateRules("name", this.fieldValidation("name")),
      ],
      parameters: [this.protocol.parameters],
      description: [
        this.protocol.description,
        ValidateRules("description", this.fieldValidation("description")),
      ],
    });
  }

  openModal(protocol) {
    if (!this.isStudyReadOnly) {
      this.initialiseForm();
      if (this.protocol.parameters.length > 0) {
        this.form.get("parameters").setValue(this.protocol.parameters);
      } else {
        this.form.get("parameters").setValue([]);
      }
      this.selectedProtocol = protocol;
      this.isModalOpen = true;
    }
  }

  updateProtocols(data, message) {
    if (!this.isStudyReadOnly) {
      this.editorService.getProtocols(null).subscribe((res) => {
        this.form.reset();
        this.form.markAsPristine();
        this.initialiseForm();
        if (!this.addNewProtocol) {
          const jsonConvert: JsonConvert = new JsonConvert();
          // assert that the protocols is a list
          const assertedProtocols = res.protocols as IProtocol[];
          this.protocol = jsonConvert.deserialize(
            assertedProtocols.filter((p) => p.name === this.protocol.name)[0],
            MTBLSProtocol
          );
          this.openModal(this.protocol);
        }

        toastr.success(message, "Success", {
          timeOut: "2500",
          positionClass: "toast-top-center",
          preventDuplicates: true,
          extendedTimeOut: 0,
          tapToDismiss: false,
        });
      });
    }
  }

  compileBody() {
    const mtblProtocol = new MTBLSProtocol();
    mtblProtocol.name = this.getFieldValue("name");
    mtblProtocol.description = this.getFieldValue("description")
      .replace(/#/g, " ")
      .replace(/"/g, "'");
    mtblProtocol.protocolType = new Ontology();
    mtblProtocol.protocolType.annotationValue = this.getFieldValue("name");
    mtblProtocol.parameters = this.getFieldValue("parameters");
    return { protocol: mtblProtocol.toJSON() };
  }

  get validation() {
    if (this.validations) {
      if (this.validationsId.includes(".")) {
        const arr = this.validationsId.split(".");
        let tempValidations = JSON.parse(JSON.stringify(this.validations));
        while (
          arr.length &&
          (tempValidations = tempValidations[arr.shift()])
        ) {}
        return tempValidations;
      }
      return this.validations[this.validationsId];
    }
  }

  fieldValidation(fieldId) {
    return this.validation ? this.validation[fieldId] : false;
  }

  getFieldValue(name) {
    return this.form.get(name).value;
  }

  setFieldValue(name, value) {
    return this.form.get(name).setValue(value);
  }
}
