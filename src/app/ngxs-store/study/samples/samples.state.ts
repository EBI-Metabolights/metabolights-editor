import { Injectable } from "@angular/core";
import { Action, Select, Selector, State, StateContext, Store } from "@ngxs/store";
import { Organisms, Samples } from "./samples.actions";
import { FilesState } from "../files/files.state";
import { Observable } from "rxjs";
import { Loading, SetLoadingInfo } from "../../non-study/transitions/transitions.actions";
import Swal from "sweetalert2";
import { StudyFile } from "src/app/models/mtbl/mtbls/interfaces/study-files.interface";
import { SamplesService } from "src/app/services/decomposed/samples.service";

// we should type the below properly once we get a better handle on what the data looks like
export interface SamplesStateModel {
    samples: Record<string, any>;
    organisms: Record<string, any>;
}

@State<SamplesStateModel>({
    name: 'samples',
    defaults: {
        samples: null,
        organisms: null
    }
})
@Injectable()
export class SampleState {


    // subscribing to other state containers isnt forbidden but feels wrong, so try and limit doing so
    @Select(FilesState.getSampleSheet) sampleSheet$: Observable<StudyFile>;

    constructor(private store: Store, private samplesService: SamplesService) {

    }

    @Action(Samples.Get)
    GetStudySamples(ctx: StateContext<SamplesStateModel>, action: Samples.Get) {
        this.sampleSheet$.subscribe(
            (sampleSheet) => {
                if (sampleSheet) {
                    this.store.dispatch(new SetLoadingInfo(this.samplesService.loadingMessage));
                    ctx.dispatch(new Samples.OrganiseAndPersist(sampleSheet.file));
                } else {
                    Swal.fire({title: 'Error', text: this.samplesService.sampleSheetMissingPopupMessage, showCancelButton: false, 
                    confirmButtonColor: "#DD6B55", confirmButtonText: "OK"});
                }
            }
        )
    }

    @Action(Samples.OrganiseAndPersist)
    OrganiseAndPersist(ctx: StateContext<SamplesStateModel>, action: Samples.OrganiseAndPersist) {
        const samples = {};
        samples["name"] = action.sampleSheetFilename
        this.samplesService.getTable(action.sampleSheetFilename).subscribe(
            (data) => {
                /**
                 * Sample sheet processing
                 */
                const columns = [];
                Object.keys(data.header).forEach((key) => {
                  const fn = "element['" + key + "']";
                  columns.push({
                    columnDef: key,
                    sticky: key === "Protocol REF" ? "true" : "false",
                    header: key,
                    cell: (element) => eval(fn),
                  });
                });
                let displayedColumns = columns.map((a) => a.columnDef);
                displayedColumns.unshift("Select");
                /* eslint-disable space-before-function-paren */
                displayedColumns.sort(function (a, b) {
                  // assert that the values are numbers, which they have to be as all header values in sample sheet objects are numbers.
                  const assertA = data.header[a] as number;
                  const assertB = data.header[b] as number;
                  return assertA - assertB;
                });
                let index = displayedColumns.indexOf("Source Name");
                if (index > -1) {
                  displayedColumns.splice(index, 1);
                }
        
                index = displayedColumns.indexOf("Characteristics[Sample type]");
                if (index > -1) {
                  displayedColumns.splice(index, 1);
                }
        
                displayedColumns.sort(
                  (a, b) =>
                    /* eslint-disable radix */
                    parseInt(this.samplesService.samplesColumnOrder[a]) -
                    parseInt(this.samplesService.samplesColumnOrder[b])
                );
        
                if (displayedColumns[1] !== "Protocol REF") {
                  displayedColumns.splice(displayedColumns.indexOf("Protocol REF"), 1);
                  displayedColumns.splice(1, 0, "Protocol REF");
                }
        
                if (displayedColumns[2] !== "Sample Name") {
                  displayedColumns.splice(displayedColumns.indexOf("Sample Name"), 1);
                  displayedColumns.splice(2, 0, "Sample Name");
                }
                displayedColumns = displayedColumns.filter(
                  (key) =>
                    key.indexOf("Term Accession Number") < 0 &&
                    key.indexOf("Term Source REF") < 0
                );
                data["columns"] = columns;
                data["displayedColumns"] = displayedColumns;
                data["file"] = action.sampleSheetFilename;
                data.data.rows ? (data["rows"] = data.data.rows) : (data["rows"] = []);
                delete data.data;
                samples["data"] = data;

                ctx.dispatch(new Samples.Set(samples))
                
                /**
                 * Organisms processing 
                 */
                const organisms = {};
                data["rows"].forEach((row) => {
                  let organismName = row["Characteristics[Organism]"] as string;
                  organismName = organismName.replace(/^[ ]+|[ ]+$/g, "");
        
                  const organismPart = row["Characteristics[Organism part]"];
                  const organismVariant = row["Characteristics[Variant]"];
                  if (organismName !== "" && organismName.replace(" ", "") !== "") {
                    if (organisms[organismName] === null) {
                      organisms[organismName] = {
                        parts: [],
                        variants: [],
                      };
                    } else {
                      if (organisms[organismName]) {
                        if (organisms[organismName].parts.indexOf(organismPart) < 0) {
                          organisms[organismName].parts.push(organismPart);
                        }
                        if (
                          organisms[organismName].variants.indexOf(organismVariant) < 0
                        ) {
                          organisms[organismName].variants.push(organismVariant);
                        }
                      }
                    }
                  }
                });
                ctx.dispatch(new Organisms.Set(organisms))
              },
              (err) => {
                console.error(`Unable to get sample sheet from MetaboLights webservice: ${err}`)
              }
        )
    }



    @Action(Samples.Set)
    SetStudySamples(ctx: StateContext<SamplesStateModel>, action: Samples.Set) {
        const state = ctx.getState();
        ctx.setState({
            ...state,
            samples: action.samples
        });
    }

    @Action(Organisms.Set)
    SetStudyOrganisms(ctx: StateContext<SamplesStateModel>, action: Organisms.Set) { 
        const state = ctx.getState();
        ctx.setState({
            ...state,
            organisms: action.organisms
        })
    }

    @Selector()
    static samples(state: SamplesStateModel): Record<string, any> {
        return state.samples
    }

    @Selector()
    static organisms(state: SamplesStateModel): Record<string, any> {
        return state.organisms
    }


}
