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
  @Input() sectionLabels: Record<number, string> = {};
  @Output() itemClick = new EventEmitter<ChecklistItem>();

  onItemClick(item: ChecklistItem) {
    this.itemClick.emit(item);
  }

  get groupedItems(): { section: number; label: string; items: ChecklistItem[] }[] {
    const groups: Record<number, ChecklistItem[]> = {};
    
    this.items.forEach(item => {
      const section = item.section || 0;
      if (!groups[section]) {
        groups[section] = [];
      }
      groups[section].push(item);
    });

    return Object.keys(groups)
      .map(key => Number(key))
      .sort((a, b) => a - b)
      .map(section => ({
        section,
        label: this.sectionLabels[section] || `Step ${section}`,
        items: groups[section]
      }));
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
