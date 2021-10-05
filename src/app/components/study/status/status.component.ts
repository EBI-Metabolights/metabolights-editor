import { Component, OnInit, Input, Inject, OnChanges, SimpleChanges } from '@angular/core';
import { NgRedux, select } from '@angular-redux/store';
import Swal from 'sweetalert2';
import { ActivatedRoute } from '@angular/router';
import { EditorService } from '../../../services/editor.service';
import * as toastr from 'toastr';
import { environment } from 'src/environments/environment';

@Component({
	selector: 'mtbls-status',
	templateUrl: './status.component.html',
	styleUrls: ['./status.component.css']
})
export class StatusComponent implements OnInit {

	@select(state => state.study.status) studyStatus;
	@select(state => state.status.isCurator) isCurator;
	@select(state => state.study.identifier) studyIdentifier;

	@select(state => state.study.readonly) readonly;
	isReadOnly: boolean = false;

	isModalOpen: boolean = false;
	isFormBusy: boolean = false;
	status: string = null
	curator: boolean = false;
	toStatus: string = 'Submitted';
	requestedStudy: string = null;

	

	constructor(private editorService: EditorService, private route: ActivatedRoute){ 
		if (!environment.isTesting) {
			this.setUpSubscriptions();
		}
	}

	setUpSubscriptions() {
		this.studyStatus.subscribe(value => { 
			if(value != null){
				this.status = value
				this.toStatus  = value
			}
		});
		this.isCurator.subscribe(value => { 
			if(value != null){
				this.curator = value
			}
		});
		this.studyIdentifier.subscribe(value => { 
			if(value != null){
				this.requestedStudy = value
			}
		});
		this.readonly.subscribe(value => { 
			if(value != null){
				this.isReadOnly = value
			}
		});
	}

	changeStatus(toStatus){
		if(!this.isReadOnly){
			if(toStatus == null){
				toStatus = this.toStatus
			}
			Swal.fire({
				  title: "Are you sure?",
				  showCancelButton: true,
				  confirmButtonColor: "#DD6B55",
				  confirmButtonText: "Confirm",
				  cancelButtonText: "Back"
			})
			.then((willChange) => {
			  if (willChange.value) {
				 this.editorService.changeStatus(toStatus).subscribe( data => {
					 this.closeModal()
					 toastr.success('Study status updated.', "Success", {
						"timeOut": "2500",
						"positionClass": "toast-top-center",
						"preventDuplicates": true,
						"extendedTimeOut": 0,
						"tapToDismiss": false
					})
					this.editorService.loadStudy(this.requestedStudy, false)
				 }, err => {
					 this.closeModal()
					 this.toStatus = this.status
					 Swal.fire({
						  title: err.json().message
					});
				 }) 
			  }
			});
		}
	}

	ngOnInit() {}

	openModal() {
		this.isModalOpen = true
	}

	closeModal() {
		this.isModalOpen = false
	}
}
