import { Component, OnInit, inject } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { EditorService } from 'src/app/services/editor.service';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, map } from 'rxjs/operators';
import { Store } from '@ngxs/store';
import { StudyCreation } from 'src/app/ngxs-store/non-study/study-creation/study-creation.actions';
import { StudyCreationState } from 'src/app/ngxs-store/non-study/study-creation/study-creation.state';

@Component({
  selector: 'mtbls-related-datasets',
  templateUrl: './related-datasets.component.html',
  styleUrls: ['./related-datasets.component.css']
})
export class RelatedDatasetsComponent implements OnInit {
  
  relatedDatasets$: Observable<any[]> = inject(Store).select(StudyCreationState.relatedDatasets);
  
  isModalOpen = false;
  form: UntypedFormGroup;
  filteredIdentifierSources$: Observable<any[]>;
  identifierPlaceholder: string = 'e.g. MTBLS1';

  constructor(private fb: UntypedFormBuilder, private editorService: EditorService, private store: Store) { }

  ngOnInit() {
    this.form = this.fb.group({
      identifierSource: ['', Validators.required],
      identifier: ['', Validators.required]
    });

    this.filteredIdentifierSources$ = this.form.get('identifierSource').valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap((value: string | any) => {
        if (!value) return of([]);
        const query = typeof value === 'string' ? value : value.name;
        if (!query || query.length < 2) {
             return of([]);
        }
        return this.editorService.getIdentifierSources(query);
      })
    );
    
    // Bind Identifier Source selection to Identifier input properties
    this.form.get('identifierSource').valueChanges.subscribe(value => {
        if (value && typeof value === 'object') {
            this.identifierPlaceholder = value.sampleId ? `e.g. ${value.sampleId}` : `e.g. ${value.prefix}:12345`;
        } else {
            this.identifierPlaceholder = 'e.g. MTBLS1';
        }
    });
  }

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.form.reset();
  }

  displayIdentifierSource(source?: any): string {
    return source ? source.name : '';
  }

  addDataset() {
    if (this.form.valid) {
      const formValue = this.form.value;
      const source = formValue.identifierSource;
      const identifier = formValue.identifier;
      
      let url = '';
      if (typeof source === 'object' && source.urlPattern) {
          url = source.urlPattern.replace('{$id}', identifier);
      } else {
          url = ''; 
      }
      
      const newDataset = {
          repository: typeof source === 'object' ? source.name : source,
          accession: identifier,
          url: url 
      };

      this.store.dispatch(new StudyCreation.AddRelatedDataset(newDataset));
      this.closeModal();
    }
  }

  removeDataset(index: number) {
    this.store.dispatch(new StudyCreation.RemoveRelatedDataset(index));
  }
}
