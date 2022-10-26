import {
  Output,
  EventEmitter,
  Component,
  OnInit,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
@Component({
  selector: 'mtbls-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.css'],
})
export class ContentComponent implements OnInit, OnChanges {
  @Input('value') content: any;
  @Input('count') count: any;
  @Input('message') message: string;

  @Output() editContent = new EventEmitter<string>();

  displayContent = '';
  displayMoreOption = false;

  constructor() {}

  ngOnInit() {
    if (this.message === '' || this.message === null) {
      this.message = 'This section is empty.';
    }

    if (this.count > 0) {
      if (this.content.length > this.count) {
        this.displayContent = this.content.slice(0, this.count);
        this.displayMoreOption = true;
      } else {
        this.displayContent = this.content;
      }
    }
  }

  toggleContent() {
    this.displayMoreOption = !this.displayMoreOption;
    if (this.displayContent.length > this.count) {
      this.displayContent = this.content.slice(0, this.count);
    } else {
      this.displayContent = this.content;
    }
  }

  emitEditContentEvent() {
    this.editContent.next('');
  }

  ngOnChanges(changes: SimpleChanges) {
    for (const key of Object.keys(changes)) {
      const change = changes[key];
      if (!change.isFirstChange()) {
        if (this.count > 0) {
          if (this.content.length > this.count) {
            this.displayContent = this.content.slice(0, this.count);
            this.displayMoreOption = true;
          } else {
            this.displayContent = this.content;
          }
        }
      }
    }
  }
}
