import { Component, OnInit, Input, Inject, OnChanges, SimpleChanges } from '@angular/core';
import { IAppState } from '../../../store';
import { NgRedux, select } from '@angular-redux/store';
import { EditorService } from '../../../services/editor.service';
import { FormBuilder, FormGroup, Validators} from '@angular/forms';
import { ValidateStudyDescription } from './description.validator';
import * as toastr from 'toastr';

@Component({
  selector: 'mtbls-description',
  templateUrl: './description.component.html',
  styleUrls: ['./description.component.css']
})
export class DescriptionComponent implements OnChanges, OnInit {
  @select(state => state.study.abstract) studyDescription; 
  @select(state => state.study.validations) studyValidations: any

  @select(state => state.study.studyDesignDescriptors) studyDesignDescriptors: any[]
  @select(state => state.study.readonly) readonly;
  
  isReadOnly: boolean = false;

  form: FormGroup;
  isFormBusy: boolean = false;
  description: string = '';
  validations: any;
  isSymbolDropdownActive: boolean = false;
  editor: any;

  validationsId = 'description';

  isModalOpen: boolean = false;
  hasChanges: boolean = false;

  constructor( private fb: FormBuilder, private editorService: EditorService, private ngRedux: NgRedux<IAppState>) {
    this.studyValidations.subscribe(value => { 
      this.validations = value;
    }); 
    this.studyDescription.subscribe(value => { 
      if(value == ''){
        this.description = 'Please add your study title here';
      }else{
        this.description = value;  
      }
    });
    this.readonly.subscribe(value => { 
			if(value != null){
				this.isReadOnly = value
			}
		});
  }

  toggleSymbolDropdown(){
    this.isSymbolDropdownActive = !this.isSymbolDropdownActive
  }

  addSymbol(content){
		this.editor.focus()
    var caretPosition = this.editor.getSelection(true);
    this.editor.insertText(caretPosition, content, 'user');
		this.toggleSymbolDropdown()
  }

  setEditor(editor: any) {
		this.editor = editor
		this.editor.clipboard.addMatcher(Node.ELEMENT_NODE, (node, delta) => {
			let ops = []
			delta.ops.forEach(op => {
				if (op.insert && typeof op.insert === 'string') {
					ops.push({
						insert: op.insert
					})
				}
			})
			delta.ops = ops
			return delta
		})
	}

  ngOnInit() {
  }

  openModal() {
    if(!this.isReadOnly){
      this.initialiseForm()
      this.isModalOpen = true
    }
  }

  initialiseForm() {
    if(!this.isReadOnly){
      // this.description = this.description.replace(new RegExp("<br />", 'g'), '\n')
      this.isFormBusy = false;
      this.form = this.fb.group({
        description:  [ this.description, ValidateStudyDescription(this.validation) ]
      });
    }
  }

  closeModal() {
    this.form = null
    this.isModalOpen = false
  }

  clearFormatting(target){
    this.setFieldValue(target, this.strip(this.getFieldValue(target)))
  }


  setFieldValue(name, value){
    return this.form.get(name).setValue(value);
  }

  getFieldValue(name){
    return this.form.get(name).value;
  }

  strip(html)
  {
       var tmp = document.createElement("DIV");
       tmp.innerHTML = html;
       return tmp.textContent || tmp.innerText || "";
  }

  save() {
    if(!this.isReadOnly){
      this.isFormBusy = true;
      this.editorService.saveAbstract(this.compileBody(this.form.get('description').value.replace(new RegExp('\n', 'g'), "<br />"))).subscribe( res => {
        this.form.get('description').setValue(res.description)
        this.form.markAsPristine()
        this.isFormBusy = false;

        toastr.success('Abstract updated.', "Success", {
          "timeOut": "2500",
          "positionClass": "toast-top-center",
          "preventDuplicates": true,
          "extendedTimeOut": 0,
          "tapToDismiss": false
        })
      }, err => {
        this.isFormBusy = false
      });
    }
  }

  compileBody(description) {
    return {
      'description': description,
    }
  }

  get validation() {
    return this.validations[this.validationsId];
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.value != undefined){
      this.description = changes.value.currentValue
    }
  }
}
