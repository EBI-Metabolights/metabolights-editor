import { MTBLSComment } from "./mtbls-comment";
import { OntologySourceReference } from "./mtbls-ontology-reference";
import { JsonObject, JsonProperty } from "json2typescript";

// turning this off here as json2typescript is old and
// I don't want to break it
/* eslint-disable @typescript-eslint/ban-types */
@JsonObject
export class Ontology {
  @JsonProperty("comments", [MTBLSComment])
  comments: MTBLSComment[] = [];

  @JsonProperty("termAccession", String)
  termAccession = "";

  @JsonProperty("annotationValue", String)
  annotationValue = "";

  @JsonProperty("annotationDefinition", String, true)
  annotationDefinition = "";

  @JsonProperty("termSource", OntologySourceReference)
  termSource: OntologySourceReference = undefined;

  @JsonProperty("name", String, true)
  name: String = "";

  toJSON() {
    return {
      comments: this.comments.map((a) => a.toJSON()),
      termAccession: this.termAccession,
      annotationValue: this.annotationValue,
      termSource: this.termSource ? this.termSource.toJSON() : null,
    };
  }
}

/**
 * If the number is positive, it means that a design descriptor has been deleted.
 * If the number is negative, it means that a design descriptor has been added.
 * If the number is 0, it means that an existing design descriptor has been updated.
 * If the number is null, it means that the two lists are completely identical
 * 
 * @param componentList The list currently held in the component
 * @param stateList The newly delivered state list
 * @returns A number indicating the difference in lists: 
 *  
 */
export function areOntologyListsDifferent(componentList: Ontology[], stateList: Ontology[]): number {
  // Check if lists are of the same length
  if (componentList.length !== stateList.length) {
    return (componentList.length - stateList.length)
  }

  // Sort lists to ensure corresponding items are compared
  const sortedComponentList = componentList.sort((a, b) => a.termAccession.localeCompare(b.termAccession));
  const sortedStateList = stateList.sort((a, b) => a.termAccession.localeCompare(b.termAccession));

  // Compare each pair of items
  for (let i = 0; i < sortedComponentList.length; i++) {
    const componentItemJson = JSON.stringify(sortedComponentList[i].toJSON());
    const stateItemJson = JSON.stringify(sortedStateList[i].toJSON());

    if (componentItemJson !== stateItemJson) {
      return 0; // Found a difference in an individual ontology
    }
  }

  // No differences found
  return null;
}

export function elucidateListComparisonResult(result: any) {
  let numberCategory ='Unknown'
  if (result === null) {
    numberCategory = 'Null';
  } else if (result > 0) {
    numberCategory = 'Positive';
  } else if (result < 0) {
    numberCategory = 'Negative';
  } else {
    numberCategory = 'Zero';
  }
  return numberCategory
}