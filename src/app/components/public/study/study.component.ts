import { Component, OnInit } from '@angular/core';
import { EditorService } from '../../../services/editor.service';

@Component({
  selector: 'study',
  templateUrl: './study.component.html',
  styleUrls: ['./study.component.css']
})
export class PublicStudyComponent implements OnInit {

  constructor(private editorService: EditorService) { }

  ngOnInit() {
    this.editorService.toggleLoading(false)
  }

}
