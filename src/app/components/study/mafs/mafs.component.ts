import { Component, OnInit, Input } from '@angular/core';
import { select } from '@angular-redux/store';

@Component({
	selector: 'mtbls-mafs',
	templateUrl: './mafs.component.html',
	styleUrls: ['./mafs.component.css']
})
export class MafsComponent implements OnInit {

	@Input('assayName') assayName: any;
	@select(state => state.study.assays) studyAssays;
	@select(state => state.study.mafs) studyMAFs;

	assays: any = [];
	mafs: any = [];
	mafNames: any = [];
	currentSubIndex: number = 0; 
	loading: boolean = false;

	constructor() { }

	ngOnInit() {
		this.mafs = []
		this.studyAssays.subscribe(value => { 
			this.assays = value
			let tempMAFs = []
			Object.values(this.assays).forEach(assay =>{
				assay['mafs'].forEach(maf => {
					tempMAFs.push(maf)
				})
			})
			let i = 0
			
			let deletedMAFS = []
			this.mafs.forEach(maf => {
				let exists = false;
				tempMAFs.forEach( mafName => {
					if(maf.name == mafName){
						exists = true
					}
				})
				if(!exists){
					deletedMAFS.push(i)
				}
				i = i + 1
			})
			if(deletedMAFS.length > 0){
				deletedMAFS.forEach(i => {
					this.mafs.splice(i, 1)
				})
			}
		});

		this.studyMAFs.subscribe(value => {
			if(this.assayName && this.assays){
				if(this.assays[this.assayName]['mafs'].length > 0){
					this.assays[this.assayName]['mafs'].forEach(mafFile =>{
						if(this.mafNames.indexOf(mafFile) == -1){
							this.mafs.push(value[mafFile])
							this.mafNames.push(mafFile)
							if(this.mafs.length > 0){
								this.mafs.sort(function(a, b){
									if(a.name < b.name) { return -1; }
									if(a.name > b.name) { return 1; }
									return 0;
								})  
							}
						}
					})
				}
			}else{
				if(Object.keys(value).length > 0){
					Object.keys(value).forEach( mafFile => {
						if(this.mafNames.indexOf(mafFile) == -1){
							this.mafs.push(value[mafFile])
							this.mafNames.push(mafFile)
							if(this.mafs.length > 0){
								this.mafs.sort(function(a, b){
									if(a.name < b.name) { return -1; }
									if(a.name > b.name) { return 1; }
									return 0;
								})  
							}
						}else if(this.mafs.length == 0){
							this.mafs.push(value[mafFile])
							this.mafNames = []
							this.mafNames.push(mafFile)
							if(this.mafs.length > 0){
								this.mafs.sort(function(a, b){
									if(a.name < b.name) { return -1; }
									if(a.name > b.name) { return 1; }
									return 0;
								})  
							}
						}
					})
				}
			}
		});
	}
	selectCurrentSubTab(i){
		this.currentSubIndex = i
	}
}
