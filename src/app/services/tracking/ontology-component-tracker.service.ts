import { Injectable } from '@angular/core';
import { OntologyComponent } from 'src/app/components/shared/ontology/ontology.component';

@Injectable({
  providedIn: 'root'
})
export class OntologyComponentTrackerService {
  private components: OntologyComponent[] = [];
  register(comp: OntologyComponent) {
    this.components.push(comp);
  }
  getAll(): OntologyComponent[] {
    return this.components;
  }
  getById(id: string): OntologyComponent {
    return this.components.filter(
      (ont) => ont.id == id
    )[0]
  }
}