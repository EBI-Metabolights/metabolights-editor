import { Component, Output, EventEmitter } from '@angular/core';
import { select } from '@angular-redux/store';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'mtbls-assays',
  templateUrl: './assays.component.html',
  styleUrls: ['./assays.component.css']
})
export class AssaysComponent {

	@select(state => state.study.assays) studyAssays;
  @select(state => state.study.studyAssays) assayFiles;
	@select(state => state.study.readonly) readonly;
	isReadOnly: boolean = false;

	assays: any = [];
  studyAssayFiles: any = [];
	currentSubIndex: number = 0;
	assaysNames: any = []

  	constructor() {
		if (!environment.isTesting) {
			this.setUpSubscriptions();
		}
  	}

	setUpSubscriptions() {
    this.assayFiles.subscribe(assayfiles =>{
      this.studyAssayFiles = assayfiles;
      if (this.studyAssayFiles) {
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < this.studyAssayFiles.length; i++) {
          this.assays.push({});
        }
      }
    });

    // tslint:disable-next-line:indent
		  this.studyAssays.subscribe(value => {
      if (this.studyAssayFiles) {
        // @ts-ignore
        let i = 0;
        this.studyAssayFiles.forEach( assayFileName => {
          if (this.assaysNames.indexOf(assayFileName.filename) === -1 && value[assayFileName.filename]) {
            this.assays[i] = value[assayFileName.filename];
            this.assaysNames.push(assayFileName.filename);
          }
          i++;
        });
      }
      // tslint:disable-next-line:indent
		});

		this.readonly.subscribe(value => {
			if(value != null){
				this.isReadOnly = value
			}
		});
	}

	assayDeleted(name){
		let i = 0
		let assayIndex  = -1
		this.assays.forEach(assay => {
			if(assay.name == name){
				assayIndex = i
			}
			i = i +1
		})
		if(i > -1){
			this.assays.splice(assayIndex, 1)
		}
		this.currentSubIndex = 0
		this.assaysNames.splice(this.assaysNames.indexOf(name), 1)
	}

  	selectCurrentSubTab(i){
		  this.currentSubIndex = i
	  }
}
