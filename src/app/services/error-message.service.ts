import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ErrorMessageService {
  private messages = new Map();
  constructor() {
    this.messages.set("E-0001-001",
    {
      header: "Not a valid study URL",
      input: "",
      content: "Study is not found or editable."
    });
    this.messages.set("E-0001-002",
      {
        header: "Metabolights server response error",
        input: "",
        content: "Error while checking study permission."
      });
    this.messages.set("E-0001-003",
      {
        header: "Invalid study accession number",
        input: "",
        content: "Study accession number is not valid."
      });
    this.messages.set("E-0001-004",
      {
        header: "Study is not public",
        input: "",
        content: "The selected study with the given accession number is not public yet."
      });
      this.messages.set("E-0001-005",
      {
        header: "No permission to access study",
        input: "",
        content: "You have no permission to access study."
      });
      this.messages.set("E-0001-006",
      {
        header: "Invalid accession number or reviewer code",
        input: "",
        content: "Study accession number or reviewer code is not valid."
      });
      this.messages.set("E-0001-007",
      {
        header: "Login failed",
        input: "",
        content: "Login inputs are not valid."
      });
  }

  getErrorMessage(id: string){
    if(this.messages.has(id)){
      const result = this.messages.get(id);
      return result;
    }
    return "";
  }
}
