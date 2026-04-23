import {
  Component,
  OnInit,
  Input,
  OnChanges,
  SimpleChanges,
  inject,
  computed,
  effect,
  signal,
} from "@angular/core";
import * as toastr from "toastr";
import { EditorService } from "../../../services/editor.service";
import { Store } from "@ngxs/store";
import { ApplicationState } from "src/app/ngxs-store/non-study/application/application.state";
import { Observable } from "rxjs";
import { ProtocolsState } from "src/app/ngxs-store/study/protocols/protocols.state";
import { MTBLSProtocol } from "src/app/models/mtbl/mtbls/mtbls-protocol";
import { SetProtocolExpand } from "src/app/ngxs-store/non-study/application/application.actions";
import { TransitionsState } from "src/app/ngxs-store/non-study/transitions/transitions.state";
import { Protocols } from "src/app/ngxs-store/study/protocols/protocols.actions";
import { Ontology } from "src/app/models/mtbl/mtbls/common/mtbls-ontology";

@Component({
  selector: "mtbls-protocols",
  templateUrl: "./protocols.component.html",
  styleUrls: ["./protocols.component.css"],
})
export class ProtocolsComponent implements OnInit, OnChanges {
  @Input("assay") assay: any;

  readonly$: Observable<boolean> = inject(Store).select(ApplicationState.readonly);
  isProtocolsExpanded$: Observable<boolean> = inject(Store).select(ApplicationState.isProtocolsExpanded);
  studyProtocols$: Observable<MTBLSProtocol[]> = inject(Store).select(ProtocolsState.protocols);
  protocolGuides$: Observable<Record<string, any>> = inject(Store).select(ProtocolsState.protocolGuides);
  protocolTemplates$: Observable<Record<string, any>> = inject(Store).select(ApplicationState.protocolTemplates);
  toastrSettings$: Observable<Record<string, any>> = inject(Store).select(ApplicationState.toastrSettings);

  actionStackFn = inject(Store).selectSignal(TransitionsState.actionStack);
  actionStack$ = computed(() => {
    const filterFn = this.actionStackFn();
    return filterFn('[protocols]')
  });
  
  isStudyReadOnly = false;

  validations: Record<string, any> = {};

  protocols: any[] = [];
  allProtocols: any[] = [];
  customProtocols: string[] = [];
  defaultProtocols: string[] = [];

  protocolGuides = {};


  actionStack = signal<string[]>([]);
  showRefreshPrompt = computed(() => this.actionStack().length > 0)
  debounceTimeout: any;

  expand = true;
  private toastrSettings: Record<string, any> = {};

  constructor(private editorService: EditorService, private store: Store) {
    this.customProtocols = [];
    this.defaultProtocols = [];
    this.protocols = [];

    this.setUpSubscriptionsNgxs();
  }



  setUpSubscriptionsNgxs() {
    this.readonly$.subscribe((value) => {
      if (value != null) {
        this.isStudyReadOnly = value;
      }
    });

    this.protocolTemplates$.subscribe(() => {
      this.refreshProtocolConfig();
    });

    this.studyProtocols$.subscribe((value) => {
      this.initialiseProtocols(value);
      this.allProtocols = value;
      this.rebuildCustomProtocols();
    });

    this.isProtocolsExpanded$.subscribe((value) => {
      this.expand = value;
    });

    this.protocolGuides$.subscribe((value) => {
      this.protocolGuides = value;
    });

    this.toastrSettings$.subscribe((settings) => {
      this.toastrSettings = settings;
    })

    effect(() => {
      const intermediateList = this.actionStack$();
      if (this.debounceTimeout) clearTimeout(this.debounceTimeout);
      this.debounceTimeout= setTimeout(() => {
        this.actionStack.set(intermediateList);
      }, 500);
    });
    
  }

  ngOnInit() {
    this.refreshProtocolConfig();
  }

  initialiseProtocols(value) {
    this.protocols = [];
    this.customProtocols = [];

    if (
      this.assay &&
      Array.isArray(this.assay.protocols) &&
      Array.isArray(value)
    ) {
      this.assay.protocols.forEach((protocol) => {
        value.forEach((p) => {
          if (p.name === protocol) {
            this.protocols.push(p);
          }
        });
      });
    } else if (Array.isArray(value)) {
      this.protocols = value;
    } else {
      this.protocols = [];
    }

  }

  toggleExpand() {
    this.store.dispatch(new SetProtocolExpand(!this.expand))
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

  private refreshProtocolConfig() {
    const assayTemplate = this.assay?.meta?.template || null;
    this.defaultProtocols = this.editorService.getDefaultProtocolNames(assayTemplate);
    this.validations = {
      name: this.editorService.getInvestigationFieldValidation("Study Protocol Name"),
      description: this.editorService.getInvestigationFieldValidation("Study Protocol Description", { assayTemplate }),
      uri: this.editorService.getInvestigationFieldValidation("Study Protocol URI"),
      version: this.editorService.getInvestigationFieldValidation("Study Protocol Version"),
      parameterName: this.editorService.getInvestigationFieldValidation("Study Protocol Parameter Name", { assayTemplate }),
    };
    this.rebuildCustomProtocols();
  }

  private rebuildCustomProtocols() {
    this.customProtocols = [];
    this.protocols.forEach((protocol) => {
      if (
        this.defaultProtocols.length > 0 &&
        this.defaultProtocols.indexOf(protocol.name) < 0
      ) {
        this.customProtocols.push(protocol.name);
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.assay) {
      this.initialiseProtocols(this.allProtocols);
      this.refreshProtocolConfig();
    }
  }

}
