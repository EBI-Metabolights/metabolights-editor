import { Component, Input, Output, EventEmitter } from "@angular/core";

export interface ChecklistItem {
  id: string;
  label: string;
  isValid: boolean;
  isRequired: boolean;
  section: number;
  error?: string;
}

@Component({
  selector: "mtbls-checklist",
  templateUrl: "./checklist.component.html",
  styleUrls: ["./checklist.component.css"],
})
export class ChecklistComponent {
  @Input() items: ChecklistItem[] = [];
  @Output() itemClick = new EventEmitter<ChecklistItem>();

  onItemClick(item: ChecklistItem) {
    this.itemClick.emit(item);
  }

  get completedCount(): number {
    return this.items.filter(item => item.isValid).length;
  }

  get totalCount(): number {
    return this.items.length;
  }

  get progressPercentage(): number {
    return this.totalCount > 0 ? (this.completedCount / this.totalCount) * 100 : 0;
  }
}
