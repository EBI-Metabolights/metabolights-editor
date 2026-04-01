import { Component, Input } from '@angular/core';
import { ViolationType } from '../validations-v2/interfaces/validation-report.types';

@Component({
  selector: 'mtbls-overview-badges',
  templateUrl: './overview-badges.component.html',
  styleUrl: './overview-badges.component.css'
})
export class OverviewBadgesComponent {

  @Input() requestedStudy: string;
  @Input() mhdAccession: string;
  @Input() categoryLabel: string;
  @Input() showCategory: boolean = false;
  @Input() studyError: boolean;
  @Input() revisionDatetime: string;
  @Input() revisionNumber: number;
  @Input() curationStatus: string;
  @Input() isOwner: boolean = false;
  @Input() isCurator: boolean = false;
  @Input() status: string;
  @Input() validationStatus: ViolationType
  @Input() validation: Record<string, any> =  {};

  

}
