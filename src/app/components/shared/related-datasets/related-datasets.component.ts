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
          // Replace pattern with identifier
          // Usually {$id} or similar placeholder. identifers.org uses {$id} typically.
          // The API returns urlPattern like "https://...id={$id}"
          url = source.urlPattern.replace('{$id}', identifier);
      } else {
          // Fallback if user typed manually or logic fails, though we enforce selection via object
          // For now, if string, we can't build URL accurately without the pattern.
          // We might assume they know what they are doing if we allowed manual entry, 
          // but better to enforce selection or just store what we have.
          // Given the requirement "store Identifier source as url" implies we need the resolved URL.
          // If the user typed manually, we might not have a URL.
          url = ''; 
      }
      
      const newDataset = {
          identifier: identifier,
          url: url 
      };

      this.store.dispatch(new StudyCreation.AddRelatedDataset(newDataset));
      this.form.reset();
    }
  }

  removeDataset(index: number) {
    this.store.dispatch(new StudyCreation.RemoveRelatedDataset(index));
  }
}
