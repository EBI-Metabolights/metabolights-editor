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
  funders: any[];
  relatedDatasets: any[];
}

@State<StudyCreationStateModel>({
  name: "studyCreation",
  defaults: {
    isCreating: false,
    factors: [],
    designDescriptors: [],
    contacts: [],
    funders: [],
    relatedDatasets: []
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
          contacts: [],
          funders: [],
          relatedDatasets: []
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
      if (action.contact && action.contact.email) {
          const exists = state.contacts.some(c => c.email === action.contact.email);
          if (exists) {
              return;
          }
      }
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

  // Funders
  @Selector()
  static funders(state: StudyCreationStateModel) {
    return state.funders;
  }

  @Action(StudyCreation.SetFunders)
  setFunders(ctx: StateContext<StudyCreationStateModel>, action: StudyCreation.SetFunders) {
      ctx.patchState({ funders: action.funders });
  }

  @Action(StudyCreation.AddFunder)
  addFunder(ctx: StateContext<StudyCreationStateModel>, action: StudyCreation.AddFunder) {
      const state = ctx.getState();
      ctx.patchState({ funders: [...state.funders, action.funder] });
  }

  @Action(StudyCreation.UpdateFunder)
  updateFunder(ctx: StateContext<StudyCreationStateModel>, action: StudyCreation.UpdateFunder) {
      const state = ctx.getState();
      const funders = [...state.funders];
      if (action.index >= 0 && action.index < funders.length) {
          funders[action.index] = action.funder;
          ctx.patchState({ funders });
      }
  }

  @Action(StudyCreation.RemoveFunder)
  removeFunder(ctx: StateContext<StudyCreationStateModel>, action: StudyCreation.RemoveFunder) {
      const state = ctx.getState();
      const funders = state.funders.filter((_, i) => i !== action.index);
      ctx.patchState({ funders });
  }

  // Related Datasets
  @Selector()
  static relatedDatasets(state: StudyCreationStateModel) {
    return state.relatedDatasets;
  }

  @Action(StudyCreation.SetRelatedDatasets)
  setRelatedDatasets(ctx: StateContext<StudyCreationStateModel>, action: StudyCreation.SetRelatedDatasets) {
      ctx.patchState({ relatedDatasets: action.datasets });
  }

  @Action(StudyCreation.AddRelatedDataset)
  addRelatedDataset(ctx: StateContext<StudyCreationStateModel>, action: StudyCreation.AddRelatedDataset) {
      const state = ctx.getState();
      ctx.patchState({ relatedDatasets: [...state.relatedDatasets, action.dataset] });
  }

  @Action(StudyCreation.UpdateRelatedDataset)
  updateRelatedDataset(ctx: StateContext<StudyCreationStateModel>, action: StudyCreation.UpdateRelatedDataset) {
      const state = ctx.getState();
      const datasets = [...state.relatedDatasets];
      if (action.index >= 0 && action.index < datasets.length) {
          datasets[action.index] = action.dataset;
          ctx.patchState({ relatedDatasets: datasets });
      }
  }

  @Action(StudyCreation.RemoveRelatedDataset)
  removeRelatedDataset(ctx: StateContext<StudyCreationStateModel>, action: StudyCreation.RemoveRelatedDataset) {
      const state = ctx.getState();
      const relatedDatasets = state.relatedDatasets.filter((_, i) => i !== action.index);
      ctx.patchState({ relatedDatasets });
  }
}
