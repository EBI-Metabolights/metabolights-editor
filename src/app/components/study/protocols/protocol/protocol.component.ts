import { Component, OnInit, Input, ViewChild, OnChanges, SimpleChanges, inject, ElementRef, ChangeDetectorRef } from "@angular/core";
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
import { getValidationRuleForField, MetabolightsFieldControls, StudyCategoryStr } from "src/app/models/mtbl/mtbls/control-list";
import { OntologySourceReference } from "src/app/models/mtbl/mtbls/common/mtbls-ontology-reference";

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
  @Input("rule") rule: any = null;
  @Input("defaultOntologies") defaultOntologies: string[] = [];

  @ViewChild(OntologyComponent) parameterName: OntologyComponent;
  @ViewChild("contentToCopy") contentToCopy!: ElementRef;

  readonly$: Observable<boolean> = inject(Store).select(ApplicationState.readonly);
  isProtocolsExpanded$: Observable<boolean> = inject(Store).select(ApplicationState.isProtocolsExpanded);
  toastrSettings$: Observable<Record<string, any>> = inject(Store).select(ApplicationState.toastrSettings);
  studyId$: Observable<string> = inject(Store).select(GeneralMetadataState.id);

  protocolGuides$: Observable<Record<string, any>> = inject(Store).select(ProtocolsState.protocolGuides);
  
  studyCreatedAt$: Observable<string> = inject(Store).select(
    GeneralMetadataState.studyCreatedAt
  );
  studyCategory$: Observable<string> = inject(Store).select(
    GeneralMetadataState.studyCategory
  );
  templateVersion$: Observable<string> = inject(Store).select(
    GeneralMetadataState.templateVersion
  );

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
  selectedParameterValue: any = null;

  addNewProtocol = false;
  caretPos = 0;

  expand = true;

  form: UntypedFormGroup;

  validationsId = "protocols.protocol";
  _controlList: any = null;

  protocolInGuides: boolean = false;
  guideText: string = "";
  coreProtocols: string[] = ['sample collection', 'extraction', 'chromatography', 'mass spectrometry', 'data transformation', 'metabolite identification']
  // store-backed legacy control lists (flat shape) and helper fields
  private legacyControlLists: Record<string, any> | null = null;
  private defaultControlListName: string = "Study Protocol Parameter Name";
  defaultControlList: { name: string; values: any[] } = { name: "", values: [] };
  private studyCategory: string = null;
  private templateVersion: string = null;
  studyCreatedAt: any;
  selectedParameter: Ontology[];

  constructor(
    private fb: UntypedFormBuilder,
    private editorService: EditorService,
    private store: Store,
    private cdr: ChangeDetectorRef
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
    
    this.studyCategory$.subscribe((value) => {
      this.studyCategory = value as StudyCategoryStr;
    });
    this.templateVersion$.subscribe((value) => {
      this.templateVersion = value;
    });
    this.studyCreatedAt$.subscribe((value) => {
      this.studyCreatedAt = value;
    });
    // subscribe to controlLists stored in application state (legacy flat payload)
    this.store.select(ApplicationState.controlLists).subscribe((lists) => {
     this.legacyControlLists = lists || {};
    });
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
    try {
      if (this.protocolSubscription && typeof this.protocolSubscription.unsubscribe === "function") {
        this.protocolSubscription.unsubscribe();
      }
    } catch (e) {
      console.warn("Failed to unsubscribe protocolSubscription:", e);
    }

    try {
      if (this.form && this.form.contains && this.form.contains("description")) {
        this.form.removeControl("description");
      }
    } catch (e) {
      console.warn("Failed to remove 'description' control:", e);
    }
  }

  openParameterModal() {
    if (this.parameterName)
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
    parameter.parameterName =  this.parameterName?.values[0] || this.selectedParameter[0];
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
              setTimeout(() => {
                this.refreshProtocols( "Protocol saved.");
              }, 0);
              this.form.removeControl("description");
              this.isModalOpen = false;
              this.cdr.detectChanges();
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
      uri: [this.protocol.uri],
      version: [this.protocol.version],
    });
  }

  openModal(protocol) {
    
    if (!this.isStudyReadOnly) {
       try {
      this._controlList = this.controlList();
    } catch (e) {
      this._controlList = null;
    }
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
    mtblProtocol.uri = this.getFieldValue("uri");
    mtblProtocol.version = this.getFieldValue("version");
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
  /**
   * Build a controlList payload for a protocol field.
   * Prefers legacy controlLists from the store, falls back to editorService.defaultControlLists.
   */
  controlList() {
    // if no explicit defaultControlListName set, try derive from protocol name (adjust to your naming convention)
    if (!this.defaultControlListName && this.protocol && this.protocol.name) {
      this.defaultControlListName = this.formatTitle(this.protocol.name);
    }

    // fill default from legacy editorService payload if available and not already set
    if (
      (!this.defaultControlList || !this.defaultControlList.name || this.defaultControlList.name.length === 0) &&
      this.editorService.defaultControlLists &&
      this.defaultControlListName in this.editorService.defaultControlLists
    ) {
      this.defaultControlList.values = this.editorService.defaultControlLists[this.defaultControlListName].OntologyTerm || [];
      this.defaultControlList.name = this.defaultControlListName;
    }

    // defaultOntologies extracted from legacy structured payload if present
    let defaultOntologies = {};
    if (
      this.legacyControlLists &&
      this.legacyControlLists.controls &&
      this.legacyControlLists.controls["investigationFileControls"] &&
      this.legacyControlLists.controls["investigationFileControls"].__default__
    ) {
      const defaultRule = this.legacyControlLists.controls["investigationFileControls"].__default__[0];
      defaultOntologies = defaultRule;
    }

    const selectionInput = {
      studyCategory: this.studyCategory,
      studyCreatedAt: this.studyCreatedAt,
      isaFileType: "investigation" as any,
      isaFileTemplateName: null,
      templateVersion: this.templateVersion,
    };

    let rule = null;
    try {
      if (this.legacyControlLists && Object.keys(this.legacyControlLists).length > 0) {
        rule = getValidationRuleForField(
          { controlLists: this.legacyControlLists } as MetabolightsFieldControls,
          this.defaultControlListName,
          selectionInput as any
        );
      }
    } catch (e) {
      rule = null;
    }

    let renderAsDropdown = false;
        
        if (rule) {
          if (rule.validationType === "selected-ontologies" && rule.termEnforcementLevel === "required") {
            renderAsDropdown = true;
            if (rule.terms && rule.terms.length > 0) {
              const ontologiesValues = rule.terms.map((t: any) => {
                const o = new Ontology();
                o.annotationValue = t.term;
                o.termAccession = t.termAccessionNumber || "";
                o.termSource = new OntologySourceReference();
                o.termSource.name = t.termSourceRef || "";
                o.termSource.description = "";
                o.termSource.file = "";
                o.termSource.version = "";
                o.termSource.provenance_name = "";
                return o;
              });
              this.defaultControlList.values = ontologiesValues; // Override with rule terms
            }
          }
        }
        
        const result = {
          ...this.defaultControlList,
          rule,
          defaultOntologies,
          renderAsDropdown,
        };
        this._controlList = result;
        return result;
      }

      onDropdownChange(event: any) {
        const ont = new Ontology();
        ont.annotationValue = event.value;
        this.selectedParameter = [ont];
        this.selectedParameterValue = event.value;
      }

      openUri(uri: string) {
        if (!uri) return;
        const url = /^(https?:\/\/)/i.test(uri) ? uri : `https://${uri}`;
        window.open(url, '_blank', 'noopener');
      }

      getFieldMetadata(fieldId: string) {
        const fieldMapping = {
          'name': 'Study Protocol Name',
          'description': 'Study Protocol Description',
          'uri': 'Study Protocol URI',
          'version': 'Study Protocol Version',
          'parameterName': 'Study Protocol Parameter Name'
        };
        const fieldName = fieldMapping[fieldId] || fieldId;
        return this.editorService.getFieldMetadata(fieldName, 'investigation', null, this.validationsId);
      }

      getFieldHint(fieldId: string): string {
        const metadata = this.getFieldMetadata(fieldId);
        if (metadata && metadata.combinedDescription) {
          return metadata.combinedDescription;
        }
        return this.fieldValidation(fieldId)?.description || '';
      }

      getFieldPlaceholder(fieldId: string): string {
        const metadata = this.getFieldMetadata(fieldId);
        if (metadata && metadata.placeholder) {
          return metadata.placeholder;
        }
        return this.fieldValidation(fieldId)?.placeholder || '';
      }

      getFieldLabel(fieldId: string): string {
        const metadata = this.getFieldMetadata(fieldId);
        if (metadata && metadata.label) {
          return metadata.label;
        }
        // Fallback to a prettified version of the field mapping if available
        const fieldMapping = {
          'name': 'Protocol Name',
          'description': 'Protocol Description',
          'uri': 'Protocol URI',
          'version': 'Protocol Version',
          'parameterName': 'Protocol Parameter Name'
        };
        return fieldMapping[fieldId] || fieldId;
      }
}
