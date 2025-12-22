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
import { ValidationState } from "src/app/ngxs-store/study/validation/validation.state";
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

  editorValidationRules$: Observable<Record<string, any>> = inject(Store).select(ValidationState.rules);
  readonly$: Observable<boolean> = inject(Store).select(ApplicationState.readonly);
  isProtocolsExpanded$: Observable<boolean> = inject(Store).select(ApplicationState.isProtocolsExpanded);
  studyProtocols$: Observable<MTBLSProtocol[]> = inject(Store).select(ProtocolsState.protocols);
  protocolGuides$: Observable<Record<string, any>> = inject(Store).select(ProtocolsState.protocolGuides);
  toastrSettings$: Observable<Record<string, any>> = inject(Store).select(ApplicationState.toastrSettings);

  actionStackFn = inject(Store).selectSignal(TransitionsState.actionStack);
  actionStack$ = computed(() => {
    const filterFn = this.actionStackFn();
    return filterFn('[protocols]')
  });
  
  isStudyReadOnly = false;

  validations: any;

  protocols: any[] = [];
  allProtocols: any[] = [];
  customProtocols: string[] = [];
  defaultProtocols: string[] = [];

  protocolGuides = {};


  actionStack = signal<string[]>([]);
  showRefreshPrompt = computed(() => this.actionStack().length > 0)
  debounceTimeout: any;

  validationsId = "protocols";
  expand = true;
  protocolUri: string = '';
  protocolVersion: string = '';
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

    this.editorValidationRules$.subscribe((value) => {
      if (value) {
        this.validations = value;
    
        // Create a sorted copy of the array using slice() to clone and sort() for sorting
        const sortedDefault = this.validationRulesGetter.default.slice().sort(
          (a, b) => a['sort-order'] - b['sort-order']
        );
    
        // Use the sorted array for mapping
        this.defaultProtocols = sortedDefault.map(protocol => protocol.title);
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

  ngOnInit() {}

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
    const targetName = "sample collection";
    const found =
      this.protocols.find((p) => p?.name?.toLowerCase() === targetName) ||
      (value || []).find((p) => p?.name?.toLowerCase() === targetName);

    if (found) {
      this.protocolUri = found.uri || "";
      this.protocolVersion = found.version || "";
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

  get validationRulesGetter() {
    return this.validations ? this.validations[this.validationsId] : null;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.assay) {
      this.initialiseProtocols(this.allProtocols);
    }
  }
   openProtocolUri(): void {
    if (!this.protocolUri) {
      return;
    }
    const url = /^(https?:\/\/)/i.test(this.protocolUri)
      ? this.protocolUri
      : `https://${this.protocolUri}`;
    window.open(url, '_blank', 'noopener');
  }
  saveProtocolMeta(): void {
    if (this.isStudyReadOnly) return;

    const targetName = "sample collection";
    const protocol =
      this.protocols.find((p) => p?.name?.toLowerCase() === targetName) ||
      this.allProtocols.find((p) => p?.name?.toLowerCase() === targetName);

    if (!protocol) {
      console.warn(`Protocol "${targetName}" not found. Aborting save.`);
      return;
    }

    const mtblProtocol = new MTBLSProtocol();
    mtblProtocol.name = protocol.name || "";
    mtblProtocol.description = protocol.description || "";
    mtblProtocol.uri = this.protocolUri || "";
    mtblProtocol.version = this.protocolVersion || "";
    mtblProtocol.protocolType = protocol.protocolType ? (protocol.protocolType as Ontology) : null;
    mtblProtocol.parameters = protocol.parameters || [];
    mtblProtocol.components = protocol.components || [];

    this.store
      .dispatch(new Protocols.Update(mtblProtocol.name, { protocol: mtblProtocol.toJSON() }))
      .subscribe(
        () => {
          this.store.dispatch(new Protocols.Get());
          try { toastr.success('Protocol metadata saved', 'Success', this.toastrSettings); } catch (e) {}
        },
        (err) => {
          console.error("Failed to save protocol meta", err);
          try { toastr.error('Failed to save protocol metadata', 'Error', this.toastrSettings); } catch (e) {}
        }
      );
  }
}
