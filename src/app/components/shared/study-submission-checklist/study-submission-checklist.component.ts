import { Component, Input, inject } from '@angular/core';
import { Store } from '@ngxs/store';
import { SetTabIndex } from 'src/app/ngxs-store/non-study/transitions/transitions.actions';

@Component({
    selector: 'mtbls-study-submission-checklist',
    templateUrl: './study-submission-checklist.component.html',
    styleUrls: ['./study-submission-checklist.component.css']
})
export class StudySubmissionChecklistComponent {
    @Input() isReadOnly: boolean = false;
    @Input() set isOpen(value: boolean) {
        this.isChecklistPopupOpen = value;
    }

    store = inject(Store);
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

    selectTab(index: number, tab: string) {
        this.store.dispatch(new SetTabIndex(index as any));
        const urlSplit = window.location.pathname
          .replace(/\/$/, "")
          .split("/")
          .filter((n) => n);
        if (urlSplit.length >= 3) {
          if (urlSplit[urlSplit.length - 1].indexOf("MTBLS") < 0 && urlSplit[urlSplit.length - 1].indexOf("REQ") < 0) {
            urlSplit.pop();
          }
        }
        window.history.pushState(
          "",
          "",
          window.location.origin + "/" + urlSplit.join("/") + "/" + tab
        );
        this.closeChecklistPopup();
    }
}
