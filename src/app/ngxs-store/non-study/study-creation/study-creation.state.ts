import { Action, Selector, State, StateContext } from "@ngxs/store";
import { Injectable } from "@angular/core";
import { StudyCreation } from "./study-creation.actions";
import { EditorService } from "src/app/services/editor.service";
import { tap } from "rxjs/operators";
import * as toastr from "toastr";

export interface StudyCreationStateModel {
  isCreating: boolean;
  factors: any[];
  designDescriptors: any[];
  contacts: any[];
}

@State<StudyCreationStateModel>({
  name: "studyCreation",
  defaults: {
    isCreating: false,
    factors: [],
    designDescriptors: [],
    contacts: []
  },
})
@Injectable()
export class StudyCreationState {
  constructor(private editorService: EditorService) {}

  @Selector()
  static factors(state: StudyCreationStateModel) {
    return state.factors;
  }

  @Selector()
  static designDescriptors(state: StudyCreationStateModel) {
    return state.designDescriptors;
  }

  @Selector()
  static contacts(state: StudyCreationStateModel) {
    return state.contacts;
  }

  @Action(StudyCreation.Reset)
  reset(ctx: StateContext<StudyCreationStateModel>) {
      ctx.patchState({
          isCreating: false,
          factors: [],
          designDescriptors: [],
          contacts: []
      });
  }

  @Action(StudyCreation.Create)
  create(ctx: StateContext<StudyCreationStateModel>, action: StudyCreation.Create) {
    const state = ctx.getState();
    ctx.patchState({ isCreating: true });

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

  // Factors
  @Action(StudyCreation.SetFactors)
  setFactors(ctx: StateContext<StudyCreationStateModel>, action: StudyCreation.SetFactors) {
      ctx.patchState({ factors: action.factors });
  }

  @Action(StudyCreation.AddFactor)
  addFactor(ctx: StateContext<StudyCreationStateModel>, action: StudyCreation.AddFactor) {
      const state = ctx.getState();
      ctx.patchState({ factors: [...state.factors, action.factor] });
  }

  @Action(StudyCreation.UpdateFactor)
  updateFactor(ctx: StateContext<StudyCreationStateModel>, action: StudyCreation.UpdateFactor) {
      const state = ctx.getState();
      const factors = [...state.factors];
      if (action.index >= 0 && action.index < factors.length) {
          factors[action.index] = action.factor;
          ctx.patchState({ factors });
      }
  }

  @Action(StudyCreation.RemoveFactor)
  removeFactor(ctx: StateContext<StudyCreationStateModel>, action: StudyCreation.RemoveFactor) {
      const state = ctx.getState();
      const factors = state.factors.filter((_, i) => i !== action.index);
      ctx.patchState({ factors });
  }

  // Design Descriptors
  @Action(StudyCreation.SetDesignDescriptors)
  setDesignDescriptors(ctx: StateContext<StudyCreationStateModel>, action: StudyCreation.SetDesignDescriptors) {
      ctx.patchState({ designDescriptors: action.descriptors });
  }

  @Action(StudyCreation.AddDesignDescriptor)
  addDesignDescriptor(ctx: StateContext<StudyCreationStateModel>, action: StudyCreation.AddDesignDescriptor) {
      const state = ctx.getState();
      ctx.patchState({ designDescriptors: [...state.designDescriptors, action.descriptor] });
  }

  @Action(StudyCreation.UpdateDesignDescriptor)
  updateDesignDescriptor(ctx: StateContext<StudyCreationStateModel>, action: StudyCreation.UpdateDesignDescriptor) {
      const state = ctx.getState();
      const descriptors = [...state.designDescriptors];
      if (action.index >= 0 && action.index < descriptors.length) {
          descriptors[action.index] = action.descriptor;
          ctx.patchState({ designDescriptors: descriptors });
      }
  }

  @Action(StudyCreation.RemoveDesignDescriptor)
  removeDesignDescriptor(ctx: StateContext<StudyCreationStateModel>, action: StudyCreation.RemoveDesignDescriptor) {
      const state = ctx.getState();
      const descriptors = state.designDescriptors.filter((_, i) => i !== action.index);
      ctx.patchState({ designDescriptors: descriptors });
  }

  // Contacts
  @Action(StudyCreation.SetContacts)
  setContacts(ctx: StateContext<StudyCreationStateModel>, action: StudyCreation.SetContacts) {
      ctx.patchState({ contacts: action.contacts });
  }

  @Action(StudyCreation.AddContact)
  addContact(ctx: StateContext<StudyCreationStateModel>, action: StudyCreation.AddContact) {
      const state = ctx.getState();
      ctx.patchState({ contacts: [...state.contacts, action.contact] });
  }

  @Action(StudyCreation.UpdateContact)
  updateContact(ctx: StateContext<StudyCreationStateModel>, action: StudyCreation.UpdateContact) {
      const state = ctx.getState();
      const contacts = [...state.contacts];
      if (action.index >= 0 && action.index < contacts.length) {
          contacts[action.index] = action.contact;
          ctx.patchState({ contacts });
      }
  }

  @Action(StudyCreation.RemoveContact)
  removeContact(ctx: StateContext<StudyCreationStateModel>, action: StudyCreation.RemoveContact) {
      const state = ctx.getState();
      const contacts = state.contacts.filter((_, i) => i !== action.index);
      ctx.patchState({ contacts });
  }
}
