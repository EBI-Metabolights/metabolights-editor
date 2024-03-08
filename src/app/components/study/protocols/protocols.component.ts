import {
  Component,
  OnInit,
  Input,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import { NgRedux, select } from "@angular-redux/store";
import { EditorService } from "../../../services/editor.service";
import { environment } from "src/environments/environment";
import { Select } from "@ngxs/store";
import { ApplicationState } from "src/app/ngxs-store/non-study/application/application.state";
import { ValidationState } from "src/app/ngxs-store/study/validation/validation.state";
import { Observable } from "rxjs";
import { ProtocolsState } from "src/app/ngxs-store/study/protocols/protocols.state";
import { IProtocol } from "src/app/models/mtbl/mtbls/interfaces/protocol.interface";
import { MTBLSProtocol } from "src/app/models/mtbl/mtbls/mtbls-protocol";

@Component({
  selector: "mtbls-protocols",
  templateUrl: "./protocols.component.html",
  styleUrls: ["./protocols.component.css"],
})
export class ProtocolsComponent implements OnInit, OnChanges {
  @select((state) => state.study.protocols) studyProtocols;
  @select((state) => state.study.validations) studyValidations;
  @select((state) => state.study.isProtocolsExpanded) isProtocolsExpanded;

  @Input("assay") assay: any;

  @select((state) => state.study.readonly) studyReadonly;

  @Select(ValidationState.rules) editorValidationRules$: Observable<Record<string, any>>;
  @Select(ApplicationState.readonly) readonly$: Observable<boolean>;
  @Select(ApplicationState.isProtocolsExpanded) isProtocolsExpanded$: Observable<boolean>;
  @Select(ProtocolsState.protocols) studyProtocols$: Observable<MTBLSProtocol[]>;

  isStudyReadOnly = false;

  validations: any;

  protocols: any[] = [];
  allProtocols: any[] = [];
  customProtocols: string[] = [];
  defaultProtocols: string[] = [];

  validationsId = "protocols";
  expand = true;

  constructor(private editorService: EditorService) {
    this.customProtocols = [];
    this.defaultProtocols = [];
    this.protocols = [];

    if (!environment.isTesting && !environment.useNewState) {
      this.setUpSubscriptions();
    }
    if (environment.useNewState) this.setUpSubscriptionsNgxs();
  }

  setUpSubscriptions() {
    this.studyReadonly.subscribe((value) => {
      if (value != null) {
        this.isStudyReadOnly = value;
      }
    });

    this.studyValidations.subscribe((value) => {
      if (value) {
        this.validations = value;
        this.validation.default.sort(
          (a, b) => a["sort-order"] - b["sort-order"]
        );
        this.defaultProtocols = this.validation.default.map(
          (protocol) => protocol.title
        );
      }
    });

    this.studyProtocols.subscribe((value) => {
      this.initialiseProtocols(value);
      this.allProtocols = value;
      this.protocols.forEach((p) => {
        if (
          this.defaultProtocols.length > 0 &&
          this.defaultProtocols.indexOf(p.name) < 0
        ) {
          this.customProtocols.push(p.name);
        }
      });
    });

    this.isProtocolsExpanded.subscribe((value) => {
      this.expand = !value;
    });
  }

  setUpSubscriptionsNgxs() {
    this.readonly$.subscribe((value) => {
      if (value != null) {
        this.isStudyReadOnly = value;
      }
    });

    this.editorValidationRules$.subscribe((value) => {
      if (value) {
        this.validations = value;
        this.validation.default.sort(
          (a, b) => a["sort-order"] - b["sort-order"]
        );
        this.defaultProtocols = this.validation.default.map(
          (protocol) => protocol.title
        );
      }
    });

    this.studyProtocols$.subscribe((value) => {
      this.initialiseProtocols(value);
      this.allProtocols = value;
      this.protocols.forEach((p) => {
        if (
          this.defaultProtocols.length > 0 &&
          this.defaultProtocols.indexOf(p.name) < 0
        ) {
          this.customProtocols.push(p.name);
        }
      });
    });

    this.isProtocolsExpanded$.subscribe((value) => {
      this.expand = !value;
    });
  }

  ngOnInit() {}

  initialiseProtocols(value) {
    this.protocols = [];
    this.customProtocols = [];
    if (this.assay != null) {
      this.assay.protocols.forEach((protocol) => {
        value.forEach((p) => {
          if (p.name === protocol) {
            this.protocols.push(p);
          }
        });
      });
    } else {
      this.protocols = value;
    }
  }

  toggleExpand() {
    this.editorService.toggleProtocolsExpand(!this.expand);
  }

  getProtocol(name) {
    let selectedProtocol = null;
    this.protocols.forEach((p) => {
      if (p.name === name) {
        selectedProtocol = p;
      }
    });
    return selectedProtocol;
  }

  get validation() {
    return this.validations ? this.validations[this.validationsId] : null;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.assay) {
      this.initialiseProtocols(this.allProtocols);
    }
  }
}
