import { Directive, HostListener, Output, EventEmitter } from '@angular/core';

@Directive({
  selector: '[editTable]'
})
export class EditTableDirective {

	@Output() copy:EventEmitter<any> = new EventEmitter();
	@Output() paste:EventEmitter<any> = new EventEmitter();
	@Output() cut:EventEmitter<any> = new EventEmitter();

  constructor(){ 
  }

  @HostListener('window:copy', ['$event'])
  onCopy(e: any) {
  	// this.copy.emit(e);
  }	

  @HostListener('window:paste', ['$event'])
  onPaste(e: any) {
  	// this.paste.emit(e);
  }

  @HostListener('window:cut', ['$event'])
  onCut(e: any) {
  	// this.cut.emit(e);
  }
}
