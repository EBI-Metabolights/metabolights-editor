import { Component, OnInit, Input } from '@angular/core';
import { NgRedux, select } from '@angular-redux/store';
import Swal from 'sweetalert2';
import { EditorService } from '../../../../services/editor.service';


@Component({
  selector: 'assay-details',
  templateUrl: './assay-details.component.html',
  styleUrls: ['./assay-details.component.css']
})
export class AssayDetailsComponent implements OnInit {

	@Input('assayName') assayName: any;
	@select(state => state.study.assays) assays;

	assay: any = null;

  	constructor(private editorService: EditorService) { }

  	ngOnInit() {
  		this.assays.subscribe(value => { 
			  this.assay = value[this.assayName];
		  });
  	}

    deleteSelectedAssay(name){
      Swal.fire({
          title: "Are you sure?",
          text: "Once deleted, you will not be able to recover this assay!",
          showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Confirm",
            cancelButtonText: "Back"
      })
      .then((willDelete) => {
        if (willDelete.value) {
          this.editorService.deleteAssay(name).subscribe( resp => {
            this.editorService.loadStudyFiles();
            Swal.fire({
              title: 'Assay deleted!',
              text: '',
              type: 'success',
              confirmButtonText: 'OK'
            }).then(() => {
            });
          })
        }
      });
    }
}
