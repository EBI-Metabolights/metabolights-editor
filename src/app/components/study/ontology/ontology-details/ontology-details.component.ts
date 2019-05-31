import { Component, OnInit, Input } from '@angular/core';
import { Ontology } from './../../../../models/mtbl/mtbls/common/mtbls-ontology';
import { EditorService } from '../../../../services/editor.service';

@Component({
  selector: 'ontology-details',
  templateUrl: './ontology-details.component.html',
  styleUrls: ['./ontology-details.component.css']
})
export class OntologyDetailsComponent implements OnInit {

    @Input('value') value: Ontology;
    details: any = null;
    isModalOpen: boolean = false;
    isLoading: boolean = false;

  	constructor(private editorService: EditorService) { }

 	  ngOnInit() {
  	}

  	openModal(){
  		this.isModalOpen = true;
  	}

  	closeModal(){
  		this.isModalOpen = false;
  	}

  	getObjectKeys(ann){
  		return Object.keys(ann)
  	}

  	displayOntologyInfo(){
      this.isLoading = true;
  		this.editorService.getOntologyTermDescription(this.value).subscribe( response => {
  			this.details = response
        this.isLoading = false;
  			this.openModal();
  		}, error => {
        this.isLoading = false;
  			this.details = null
  		})
  	}

}
