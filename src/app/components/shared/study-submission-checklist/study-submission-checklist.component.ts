import { Component, Input, inject } from '@angular/core';
import { Store } from '@ngxs/store';
import { SetChecklistSeen, SetChecklistStudyId, SetTabIndex } from 'src/app/ngxs-store/non-study/transitions/transitions.actions';
import { TransitionsState } from 'src/app/ngxs-store/non-study/transitions/transitions.state';

@Component({
    selector: 'mtbls-study-submission-checklist',
    templateUrl: './study-submission-checklist.component.html',
    styleUrls: ['./study-submission-checklist.component.css']
})
export class StudySubmissionChecklistComponent {
    @Input() isReadOnly: boolean = false;
    @Input() set isOpen(value: boolean) {
        if (value) {
            const currentStudyId = this.getStudyIdFromPath();
            const storedStudyId = this.store.selectSnapshot(TransitionsState.checklistStudyId);
            if (currentStudyId && currentStudyId !== storedStudyId) {
                this.store.dispatch(new SetChecklistStudyId(currentStudyId));
                this.store.dispatch(new SetChecklistSeen(false));
            }
            const seen = this.store.selectSnapshot(TransitionsState.checklistSeen);
            if (!seen) {
                this.isChecklistPopupOpen = true;
                this.store.dispatch(new SetChecklistSeen(true));
            } else {
                this.isChecklistPopupOpen = false;
            }
        } else {
            this.isChecklistPopupOpen = false;
        }
    }

    store = inject(Store);
    isChecklistPopupOpen = false;
    checklistStepExpandedIndex = 0;

    toggleChecklistPopup() {
        this.isChecklistPopupOpen = !this.isChecklistPopupOpen;
        if (this.isChecklistPopupOpen) {
            this.store.dispatch(new SetChecklistSeen(true));
        }
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

    private getStudyIdFromPath(): string | null {
        const parts = window.location.pathname
            .replace(/\/$/, "")
            .split("/")
            .filter((n) => n);
        for (let i = parts.length - 1; i >= 0; i--) {
            const p = parts[i];
            if (p.startsWith("MTBLS") || p.startsWith("REQ")) {
                return p;
            }
        }
        return null;
    }
}
