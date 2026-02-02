import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { Router } from "@angular/router";

@Component({
  selector: "mtbls-progress",
  templateUrl: "./progress.component.html",
  styleUrls: ["./progress.component.css"],
})
export class ProgressComponent implements OnInit {
  @Input() step: number;
  @Input() study: string;
  @Input() internalNavigationOnly = false;
  @Input() allowBackward = true;
  @Output() stepClick = new EventEmitter<number>();

  constructor(private router: Router) {}

  ngOnInit() {}

  redirectTo(component, step, index) {
    if (index < this.step) {
      if (!this.allowBackward) {
        return;
      }
      if (this.internalNavigationOnly) {
        this.stepClick.emit(index);
        return;
      }
      if (step) {
        this.router.navigate(["/guide/" + step + "/" + component, this.study]);
      } else {
        this.router.navigate(["/guide/" + component, this.study]);
      }
    }
  }
}
