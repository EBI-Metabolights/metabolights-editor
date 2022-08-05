import { HttpClient } from '@angular/common/http';
import { Component, ViewEncapsulation, ElementRef } from '@angular/core';
import { EditorService } from './services/editor.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent {
    constructor(private elementRef:ElementRef,  private editorService: EditorService ) {
      let jwt = this.elementRef.nativeElement.getAttribute('mtblsjwt')
      let user = this.elementRef.nativeElement.getAttribute('mtblsuser')

      let isOwner = this.elementRef.nativeElement.getAttribute('isOwner')
      let isCurator = this.elementRef.nativeElement.getAttribute('isCurator')
      
      let mtblsid = this.elementRef.nativeElement.getAttribute('mtblsid')
      let obfuscationcode = this.elementRef.nativeElement.getAttribute('obfuscationcode')

      if(jwt && jwt != '' && user && user != ''){
        localStorage.setItem('mtblsuser', user);
        localStorage.setItem('mtblsjwt', jwt);
      }else if(mtblsid && mtblsid != '' && obfuscationcode && obfuscationcode != ''){
        localStorage.setItem('mtblsid', mtblsid);
        localStorage.setItem('obfuscationcode', obfuscationcode);
      }else{
        localStorage.removeItem('mtblsjwt');
        localStorage.removeItem('mtblsuser');
      }

      if(isOwner != null && isOwner != undefined){
        localStorage.setItem('isOwner', isOwner);
      }else{
        localStorage.removeItem('isOwner');
      }
      
      if(isCurator != null && isCurator != undefined){
        localStorage.setItem('isCurator', isCurator);
      }else{
        localStorage.removeItem('isCurator');
      }
      this.editorService.loadGuides();
    }
}
