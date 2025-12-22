import { Action, State, StateContext } from "@ngxs/store";
import { Injectable } from "@angular/core";
import { StudyCreation } from "./study-creation.actions";
import { EditorService } from "src/app/services/editor.service"; // Ensure this service can handle the request or create a new one
import { tap } from "rxjs/operators";
import * as toastr from "toastr";

export interface StudyCreationStateModel {
  isCreating: boolean;
}

@State<StudyCreationStateModel>({
  name: "studyCreation",
  defaults: {
    isCreating: false,
  },
})
@Injectable()
export class StudyCreationState {
  constructor(private editorService: EditorService) {}

  @Action(StudyCreation.Create)
  create(ctx: StateContext<StudyCreationStateModel>, action: StudyCreation.Create) {
    const state = ctx.getState();
    ctx.patchState({ isCreating: true });

    // Assuming createStudy method exists or will be added to EditorService
    // If not, we might need to add it or use HttpClient directly if preferred, 
    // but service is better.
    // tailored for the provided JSON payload structure.
    return this.editorService.createStudy(action.payload).pipe(
      tap(
        (response) => {
             toastr.success("Study created successfully.", "Success");
             ctx.patchState({ isCreating: false });
        },
        (error) => {
            toastr.error("Failed to create study.", "Error");
            ctx.patchState({ isCreating: false });
        }
      )
    );
  }
}
