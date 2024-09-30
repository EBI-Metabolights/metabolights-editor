import { Component, Input  } from '@angular/core';

@Component({
  selector: 'app-no-violations',
  standalone: false,
  templateUrl: './no-violations.component.html',
  styleUrl: './no-violations.component.css'
})
export class NoViolationsComponent {

  @Input() studyId: string;
  @Input() section: boolean = false;
  @Input() filter: boolean = false;

}
