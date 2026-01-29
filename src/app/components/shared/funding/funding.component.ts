import { Component, OnInit, Input, Output, EventEmitter, inject } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { EditorService } from 'src/app/services/editor.service';
import { Observable, of } from 'rxjs';
import { map, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

@Component({
  selector: 'mtbls-funding',
  templateUrl: './funding.component.html',
  styleUrls: ['./funding.component.css']
})
export class FundingComponent implements OnInit {
  @Input() controlList: any;
  @Input() funders: any[] = [];
  @Input() readonly: boolean = false;
  
  @Output() saved = new EventEmitter<any>();
  @Output() deleted = new EventEmitter<number>();
  
  form: UntypedFormGroup;
  filteredFunderOrganizations$: Observable<any[]>;
  isModalOpen = false;
  editingIndex = -1;

  constructor(private fb: UntypedFormBuilder, private editorService: EditorService) { }

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
    this.editingIndex = -1;
    this.isModalOpen = true;
  }

  editFunder(index: number, funder: any) {
      this.editingIndex = index;
      this.isModalOpen = true;
      // Reconstruct the organization object for the autocomplete
      const orgObject = {
          name: funder.fundingOrganization.annotationValue,
          annotationValue: funder.fundingOrganization.annotationValue,
          id: funder.fundingOrganization.termAccession
      };
      this.form.patchValue({
          funderOrganization: orgObject,
          funderId: funder.fundingOrganization.termAccession,
          grantIdentifier: funder.grantIdentifier
      });
  }

  closeModal() {
    this.isModalOpen = false;
    this.editingIndex = -1;
    this.form.reset();
  }

  displayFunderName(org?: any): string {
    return org ? (typeof org === 'string' ? org : (org.name || org.annotationValue)) : '';
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

      this.saved.emit({ funder: newFunder, index: this.editingIndex });
      this.closeModal();
    }
  }

  removeFunder(index: number) {
    this.deleted.emit(index);
  }
}
