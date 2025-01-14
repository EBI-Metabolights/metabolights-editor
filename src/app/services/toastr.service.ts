import { Injectable } from '@angular/core';
import * as toastr from "toastr";

export type ToastrType = "Info" | "Error" | "Warning" | "Success"

@Injectable({
  providedIn: 'root'
})
export class ToastrService {

  defaultSettings: Record<string, any> = {
    timeOut: "5000",
    positionClass: "toast-top-center",
    preventDuplicates: true,
    extendedTimeOut: 0,
    tapToDismiss: false,
  }

  constructor() { }

  pop(message: string, type: ToastrType, title?: string): void {
    const args: any[] = [message];
    if (title !== undefined) args.push(title)
    args.push(this.defaultSettings);
    console.log(...args);
    toastr[type.toLowerCase()](...args);
  }
}
