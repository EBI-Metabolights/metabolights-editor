import { Directive, ElementRef, Input } from '@angular/core';

@Directive({
  selector: '[appTooltip]'
})
export class TooltipDirective {

  @Input() appTooltip = '';

  constructor(private el: ElementRef) {
    this.setMessage(this.appTooltip);
   }

   private setMessage(message) {
     console.log(`hit directive with ${message}`)
     this.el.nativeElement.setAttribute('matTooltip', 'why wont this work');
   }

}
