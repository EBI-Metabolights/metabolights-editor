import { Component, OnInit, Input, Inject, OnChanges, SimpleChanges } from '@angular/core';
import { NgRedux, select } from '@angular-redux/store';
import Swal from 'sweetalert2';
import { ActivatedRoute } from '@angular/router';
import { EditorService } from '../../../services/editor.service';
import * as toastr from 'toastr';

@Component({
	selector: 'mtbls-release-date',
	templateUrl: './release-date.component.html',
	styleUrls: ['./release-date.component.css']
})
export class ReleaseDateComponent implements OnInit {
	@select(state => state.study.releaseDate) studyReleaseDate;
	@select(state => state.study.identifier) studyIdentifier;
	isModalOpen: boolean = false;
	isFormBusy: boolean = false;
	requestedStudy: string = null;
	releaseDate: Date = null;
	constructor(private editorService: EditorService) {
		this.studyReleaseDate.subscribe(value => { 
			if(value != null){
				if(value != ''){
					this.releaseDate = value
				}else{
					this.editorService.metaInfo().subscribe(response => {
						this.releaseDate = response.data[1].split(":")[1]
						this.updateReleaseDateSilent(this.releaseDate)
					})
				}
			}
		});
		this.studyIdentifier.subscribe(value => { 
			if(value != null){
				this.requestedStudy = value
			}
		});
	}

	updateReleaseDateSilent(val){
		this.editorService.changeReleasedate(val).subscribe( data => {
			console.log("Release date missing in investigation file. Updated release date in investigation")
		}, err => {
		}) 
	}

	updateReleaseDate(op, e){
		let selectedValue = new Date(e.value)
		let dateTo = selectedValue.getFullYear() + "-" + this.str_pad(selectedValue.getMonth()+1) +  "-" + this.str_pad(selectedValue.getDate())
		if(selectedValue != null){
			Swal.fire({
			  	title: "Are you sure? Would you like to change your study release date to " + dateTo,
			  	showCancelButton: true,
	      		confirmButtonColor: "#DD6B55",
	      		confirmButtonText: "Confirm",
	      		cancelButtonText: "Back"
			})
			.then((willChange) => {
			  if (willChange.value) {
			 	this.editorService.changeReleasedate(dateTo).subscribe( data => {
			 		this.closeModal()
			 		toastr.success('Study release date updated.', "Success", {
				        "timeOut": "2500",
				        "positionClass": "toast-top-center",
				        "preventDuplicates": true,
				        "extendedTimeOut": 0,
				        "tapToDismiss": false
				    })
				    this.editorService.loadStudy(this.requestedStudy)
			 	}, err => {
			 		this.closeModal()
			 		Swal.fire({
					  	title: err.json().message
					});
			 	}) 
			  }
			});
		}
	}

	str_pad(n) {
	    return String("00" + n).slice(-2);
	}

	ngOnInit() {
	}

	openModal() {
		this.isModalOpen = true
	}

	closeModal() {
		this.isModalOpen = false
	}

}
