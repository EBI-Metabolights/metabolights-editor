import { Component, OnInit, Input, Output, EventEmitter, inject } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { Ontology } from 'src/app/models/mtbl/mtbls/common/mtbls-ontology';
import { EditorService } from 'src/app/services/editor.service';
import { Observable, of } from 'rxjs';
import { startWith, map, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Store } from '@ngxs/store';
import { StudyCreation } from 'src/app/ngxs-store/non-study/study-creation/study-creation.actions';
import { StudyCreationState } from 'src/app/ngxs-store/non-study/study-creation/study-creation.state';

@Component({
  selector: 'mtbls-funding',
  templateUrl: './funding.component.html',
  styleUrls: ['./funding.component.css']
})
export class FundingComponent implements OnInit {
  @Input() controlList: any;
  
  funders$: Observable<any[]> = inject(Store).select(StudyCreationState.funders);
  
  form: UntypedFormGroup;
  filteredFunderOrganizations$: Observable<any[]>;
  isModalOpen = false;

  constructor(private fb: UntypedFormBuilder, private editorService: EditorService, private store: Store) { }

  ngOnInit() {
    this.form = this.fb.group({
      funderOrganization: ['', Validators.required],
      funderId: [''],
      grantIdentifier: ['']
    });

    this.filteredFunderOrganizations$ = this.form.get('funderOrganization').valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap((value: string | any) => {
        if (!value) return of([]);
        const query = typeof value === 'string' ? value : (value.name || value.annotationValue);
        if (!query || query.length < 3) {
             return of([]);
        }
        return this.editorService.getRorOrganizations(query).pipe(
             map((res: any) => {
                 const docs = res?.response?.docs || [];
                 return docs.map((doc: any) => ({
                    id: doc.iri,
                    name: doc.label || '(Unknown name)',
                    synonyms: doc.synonym || [],
                    description: doc.description?.[0] || '',
                    ontology_prefix: doc.ontology_prefix
                 }));
             })
        );
      })
    );
  }

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.form.reset();
  }

  displayFunderName(org?: any): string {
    return org ? (org.name || org.annotationValue) : '';
  }

  onFunderSelected(event: any) {
    const selectedFunder = event.option.value;
    if (selectedFunder && selectedFunder.id) {
        this.form.patchValue({ funderId: selectedFunder.id });
    }
  }
  
  getFunderRorIdUrl() {
      const org = this.form.get('funderOrganization')?.value;
      if (!org) {
          return "https://ror.org/search?query=";
      }
      const query = typeof org === 'string' ? org : (org.name || org.annotationValue);
      return "https://ror.org/search?query=" + (query || "");
  }

  addFunder() {
    if (this.form.valid) {
      const formValue = this.form.value;
      const funderOrg = formValue.funderOrganization;
      
      const newFunder = {
          fundingOrganization: {
              comments: [],
              annotationValue: typeof funderOrg === 'string' ? funderOrg : funderOrg.name,
              termSource: {
                  comments: [],
                  name: "ROR",
                  file: "",
                  version: "",
                  description: ""
              },
              termAccession: formValue.funderId || ""
          },
          grantIdentifier: formValue.grantIdentifier || ""
      };

      this.store.dispatch(new StudyCreation.AddFunder(newFunder));
      this.closeModal();
    }
  }

  removeFunder(index: number) {
    this.store.dispatch(new StudyCreation.RemoveFunder(index));
  }
}
