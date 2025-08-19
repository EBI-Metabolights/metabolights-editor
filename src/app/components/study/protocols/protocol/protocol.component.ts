import { Component, OnInit, Input, ViewChild, OnChanges, SimpleChanges, inject, ElementRef } from "@angular/core";
import { UntypedFormBuilder, UntypedFormGroup } from "@angular/forms";
import { EditorService } from "../../../../services/editor.service";
import {
  MTBLSProtocol,
  ProtocolParameter,
} from "./../../../../models/mtbl/mtbls/mtbls-protocol";
import { Ontology } from "./../../../../models/mtbl/mtbls/common/mtbls-ontology";

import { ValidateRules } from "./protocol.validator";
import { OntologyComponent } from "../../../shared/ontology/ontology.component";
import * as toastr from "toastr";
import {  Store } from "@ngxs/store";
import { ApplicationState } from "src/app/ngxs-store/non-study/application/application.state";
import { Observable, Subscription } from "rxjs";
import { Protocols } from "src/app/ngxs-store/study/protocols/protocols.actions";
import { Assay } from "src/app/ngxs-store/study/assay/assay.actions";
import { GeneralMetadataState } from "src/app/ngxs-store/study/general-metadata/general-metadata.state";
import { ProtocolsState } from "src/app/ngxs-store/study/protocols/protocols.state";

@Component({
  selector: "mtbls-protocol",
  templateUrl: "./protocol.component.html",
  styleUrls: ["./protocol.component.css"],
})
export class ProtocolComponent implements OnInit, OnChanges {
  @Input("value") protocol: any;
  @Input("required") required = false;
  @Input("validations") validations: any;
  @Input("guides") guides: Record<string, any> = {};


  @ViewChild(OntologyComponent) parameterName: OntologyComponent;
  @ViewChild("contentToCopy") contentToCopy!: ElementRef;

  readonly$: Observable<boolean> = inject(Store).select(ApplicationState.readonly);
  isProtocolsExpanded$: Observable<boolean> = inject(Store).select(ApplicationState.isProtocolsExpanded);
  toastrSettings$: Observable<Record<string, any>> = inject(Store).select(ApplicationState.toastrSettings);
  studyId$: Observable<string> = inject(Store).select(GeneralMetadataState.id);

  protocolGuides$: Observable<Record<string, any>> = inject(Store).select(ProtocolsState.protocolGuides);


  private studyId: string =  null;
  private toastrSettings: Record<string, any> = {};

  private protocolSubscription: Subscription;

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

  form: UntypedFormGroup;

  validationsId = "protocols.protocol";

  protocolInGuides: boolean = false;
  guideText: string = "";
  coreProtocols: string[] = ['sample collection', 'extraction', 'chromatography', 'mass spectrometry', 'data transformation', 'metabolite identification']

  constructor(
    private fb: UntypedFormBuilder,
    private editorService: EditorService,
    private store: Store
  ) {
   // this.setUpSubscriptionsNgxs();
  }

  ngOnInit() {
    this.setUpSubscriptionsNgxs();

    if (this.protocol == null) {
      this.addNewProtocol = true;
    } else {
     this.isProtocolInGuides();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    //this.isProtocolInGuides();
    
  }

  setUpSubscriptionsNgxs() {
    this.studyId$.subscribe((id) => {
      this.studyId = id;
    })
    this.isProtocolsExpanded$.subscribe((value) => {
      this.expand = value;
    });

    this.readonly$.subscribe((value) => {
      if (value !== null && this.protocol) {
        this.isStudyReadOnly = value;
        if(!this.isStudyReadOnly) {
          this.protocolGuides$.subscribe((value) => {
            if (Object.keys(value).includes(this.protocol.name)) {
              this.guideText = value[this.protocol.name];
            }
          })
        }
      }
    });
    this.toastrSettings$.subscribe((settings) => {
      this.toastrSettings = settings;
    })
  }


  toggleExpand() {
    this.expand = !this.expand;
  }

  isProtocolInGuides(): void {
    let duds = [undefined, null]
    if (duds.includes(this.guides)) this.protocolInGuides = false // this may now be redundant
    let result = Object.keys(this.guides).includes(this.protocol.name)
    this.protocolInGuides = result
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
      this.store.dispatch(new Assay.AddColumn(assay, { data: column }, "assay", this.studyId)).subscribe(
      (completed) => {
        toastr.success("Assay specifications updated", "success", this.toastrSettings);
      },
      (error) => {
        console.log(error)
      }
    )
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
    this.protocolSubscription.unsubscribe();
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


  saveNgxs() {
    if (!this.isStudyReadOnly) {
      if (this.getFieldValue("description")) {
        this.isFormBusy = true;
        if (!this.addNewProtocol) { // If we are updating an exisiting protocol
          this.store.dispatch(new Protocols.Update(this.protocol.name, this.compileBody())).subscribe(
            (completed) => {
              this.refreshProtocols("Protocol updated.", this.protocol.name);
              this.form.removeControl("description");
            },
            (err) => {
              this.isFormBusy = false;
            }
          )
        } else {
          this.store.dispatch(new Protocols.Add(this.protocol.name, this.compileBody())).subscribe(
            (completed) => {
              this.refreshProtocols( "Protocol saved.");
              this.form.removeControl("description");
              this.isModalOpen = false;
            },
            (error) => {
              this.isFormBusy = false;
            }
          )
        }
      } else {
        alert("Protocol description cannot be empty");
      }
    }
  }


  deleteNgxs() {
    if (!this.isStudyReadOnly) {
      if (!this.required) {
        this.store.dispatch(new Protocols.Delete(this.protocol.name)).subscribe(
          (res) => {
            this.addNewProtocol = true;
            this.refreshProtocols("Protocol deleted.");
            this.form.removeControl("description");
            this.isDeleteModalOpen = false;
            this.isModalOpen = false;
          },
          (error) => {
            this.isFormBusy = false;
          }
        )
      } else {
        toastr.error("Cannot delete a default protocol", "Error", this.toastrSettings);
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


  refreshProtocols(message, name?) {
    this.store.dispatch(new Protocols.Get()).subscribe(
      (completed) => {
        this.form.reset();
        this.form.markAsPristine();
        //this.initialiseForm();
        if (!this.addNewProtocol) {
          /**
           * This is an extraordinary antipattern but don't have much of a choice,
           * we can't change the components current protocol via the state without destroying
           * the component that has the modal rendered.
           */
          this.protocolSubscription = this.store.select(ProtocolsState.specificProtocol(name))
          .subscribe(
            (protocol) => {
              this.protocol = protocol;
              this.openModal(this.protocol);
            }
          )

        }
        toastr.success(message, "Success", this.toastrSettings)

      }
    )
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

  isCoreProtocol(name: string): boolean {
    return this.coreProtocols.includes(name.toLowerCase())
  }
  copyContent() {
    const text = this.contentToCopy.nativeElement.innerText;
    this.editorService.copyContent(text);
  }
}
