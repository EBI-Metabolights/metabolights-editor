import { Component, OnInit, Input, Output, EventEmitter, inject } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { EditorService } from 'src/app/services/editor.service';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, map } from 'rxjs/operators';

@Component({
  selector: 'mtbls-related-datasets',
  templateUrl: './related-datasets.component.html',
  styleUrls: ['./related-datasets.component.css']
})
export class RelatedDatasetsComponent implements OnInit {
  
  @Input() datasets: any[] = [];
  @Input() readonly: boolean = false;
  
  @Output() saved = new EventEmitter<any>();
  @Output() deleted = new EventEmitter<number>();
  
  isModalOpen = false;
  editingIndex = -1;
  form: UntypedFormGroup;
  filteredIdentifierSources$: Observable<any[]>;
  identifierPlaceholder: string = 'e.g. MTBLS1';

  constructor(private fb: UntypedFormBuilder, private editorService: EditorService) { }

  ngOnInit() {
    this.form = this.fb.group({
      identifierSource: ['', Validators.required],
      identifier: ['', Validators.required]
    });

    this.filteredIdentifierSources$ = this.form.get('identifierSource').valueChanges.pipe(
      debounceTime(300),
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
            
            // Set dynamic pattern validator if pattern is provided
            if (value.pattern) {
                this.form.get('identifier').setValidators([Validators.required, Validators.pattern(value.pattern)]);
            } else {
                this.form.get('identifier').setValidators([Validators.required]);
            }
        } else {
            this.identifierPlaceholder = 'e.g. MTBLS1';
            this.form.get('identifier').setValidators([Validators.required]);
        }
        this.form.get('identifier').updateValueAndValidity();
    });
  }

  openModal() {
    this.editingIndex = -1;
    this.isModalOpen = true;
  }

  editDataset(index: number, dataset: any) {
      this.editingIndex = index;
      this.isModalOpen = true;
      // Reconstruct the source object for the autocomplete
      const sourceObject = {
          name: dataset.repository
      };
      this.form.patchValue({
          identifierSource: sourceObject,
          identifier: dataset.accession
      });
  }

  closeModal() {
    this.isModalOpen = false;
    this.editingIndex = -1;
    this.form.reset();
  }

  displayIdentifierSource(source?: any): string {
    return source ? (typeof source === 'string' ? source : source.name) : '';
  }

  addDataset() {
    if (this.form.valid) {
      const formValue = this.form.value;
      const source = formValue.identifierSource;
      const identifier = formValue.identifier;
      
      let constructedUrl = '';
      if (typeof source === 'object' && source.urlPattern) {
          constructedUrl = source.urlPattern.replace('{$id}', identifier);
      }

      const newDataset = {
          repository: typeof source === 'object' ? source.name : source,
          accession: identifier,
          url: constructedUrl 
      };

      this.saved.emit({ dataset: newDataset, index: this.editingIndex });
      this.closeModal();
    }
  }

  removeDataset(index: number) {
    this.deleted.emit(index);
  }

  get hasValidDatasets(): boolean {
    return this.datasets && this.datasets.length > 0 && this.datasets.some(dataset => 
      (dataset?.repository && dataset.repository.trim() !== '') || 
      (dataset?.accession && dataset.accession.trim() !== '')
    );
  }
}
