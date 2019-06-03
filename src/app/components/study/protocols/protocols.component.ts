import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NgRedux, select } from '@angular-redux/store';

@Component({
	selector: 'mtbls-protocols',
	templateUrl: './protocols.component.html',
	styleUrls: ['./protocols.component.css']
})
export class ProtocolsComponent implements OnInit, OnChanges {

	@select(state => state.study.protocols) studyProtocols;
	@select(state => state.study.validations) studyValidations;

	@Input('assay') assay: any;

	validations: any;

	protocols: any[] = [];
	allProtocols: any[] = [];
	customProtocols: string[] = []
	defaultProtocols: string[] = []

	validationsId = 'protocols';

	constructor() {
		this.customProtocols = []
		this.defaultProtocols = []
		this.protocols = []
		
		this.studyProtocols.subscribe(value => { 
			this.initialiseProtocols(value)
			this.allProtocols = value;
		});

		this.studyValidations.subscribe(value => { 
			if(value){
				this.validations = value;
		      	this.validation.default.sort(function(a, b){
				    return a['sort-order']-b['sort-order']
				})
				this.defaultProtocols = this.validation.default.map( protocol => protocol.title)
				this.protocols.forEach( p => {
					if (this.defaultProtocols.indexOf(p.name) < 0){
						this.customProtocols.push(p.name)
					}
				})
			}
	    });
	}
	
	ngOnInit() {
	}

	initialiseProtocols(value){
		this.protocols = []
		if(this.assay != null){
			this.assay.protocols.forEach(protocol => {
				value.forEach( p => {
					if( p.name == protocol ){
						this.protocols.push(p)			
					}
				})
			})
		}else{
			this.protocols = value;
		}
	}

	getProtocol(name){
		let selectedProtocol = null;
		this.protocols.forEach(p => {
			if (p.name == name){
				selectedProtocol = p
			}
		})
		return selectedProtocol;
	}

	get validation() {
		return this.validations ? this.validations[this.validationsId] : null;
	}

	ngOnChanges(changes: SimpleChanges) {
	 	if(changes['assay']){
	 		this.initialiseProtocols(this.allProtocols)
	 	}
  	}
}
