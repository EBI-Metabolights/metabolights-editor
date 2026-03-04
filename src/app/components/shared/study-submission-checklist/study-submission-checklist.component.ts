import { Component, Input } from '@angular/core';

@Component({
    selector: 'mtbls-study-submission-checklist',
    templateUrl: './study-submission-checklist.component.html',
    styleUrls: ['./study-submission-checklist.component.css']
})
export class StudySubmissionChecklistComponent {
    @Input() isReadOnly: boolean = false;

    isChecklistPopupOpen = false;
    checklistStepExpandedIndex = 0;

    toggleChecklistPopup() {
        this.isChecklistPopupOpen = !this.isChecklistPopupOpen;
    }

    closeChecklistPopup() {
        this.isChecklistPopupOpen = false;
    }

    toggleChecklistStepExpand(index: number) {
        this.checklistStepExpandedIndex =
            this.checklistStepExpandedIndex === index ? -1 : index;
    }
}
