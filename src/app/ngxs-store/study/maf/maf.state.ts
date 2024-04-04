import { Injectable } from "@angular/core";
import { Action, Selector, State, StateContext, Store } from "@ngxs/store";
import { MAF } from "./maf.actions";
import { MafService } from "src/app/services/decomposed/maf.service";

export interface MAFStateModel {
    mafs: Record<string, any>
}

@State<MAFStateModel>({
    name: 'mafs',
    defaults: {
        mafs: {}
    }
})
@Injectable()
export class MAFState {
    
    constructor(private store: Store, private mafService: MafService) {}

    @Action(MAF.Set)
    SetStudyMAF(ctx: StateContext<MAFStateModel>, action: MAF.Set) {
        const state = ctx.getState();
        const tempMAFS = Object.assign({}, state.mafs);
        tempMAFS[action.maf.data.file] = action.maf;
        ctx.setState({
            ...state,
            mafs: tempMAFS
        })

    }

    @Action(MAF.Organise)
    OrganiseMAF(ctx: StateContext<MAFStateModel>, action: MAF.Organise) {
        this.mafService.getMAFSheet(action.filename).subscribe(
            (mdata) => {
                const mcolumns = [];
                const maf = {};
          
                mcolumns.push({
                  columnDef: "Structure",
                  sticky: "true",
                  header: "Structure",
                  structure: true,
                  cell: (element) => eval("element['database_identifier']"),
                });
          
                Object.keys(mdata.header).forEach((key) => {
                  const fn = "element['" + key + "']";
                  mcolumns.push({
                    columnDef: key, //.toLowerCase().split(" ").join("_")
                    sticky: "false",
                    header: key,
                    cell: (element) => eval(fn),
                  });
                });
          
                let mdisplayedColumns = mcolumns.map((a) => a.columnDef);
                mdisplayedColumns.unshift("Select");
                mdisplayedColumns.sort((a, b) => {
                  // assert that the values are numbers, which they have to be as all header values in maf sheet objects are numbers.
                  const assertA = mdata.header[a] as number;
                  const assertB = mdata.header[b] as number;
                  return assertA - assertB;
                });
                mdisplayedColumns = mdisplayedColumns.filter(
                  (key) =>
                    key.indexOf("Term Accession Number") < 0 &&
                    key.indexOf("Term Source REF") < 0
                );
          
                mdata["columns"] = mcolumns;
                mdata["displayedColumns"] = mdisplayedColumns;
                mdata["rows"] = mdata.data.rows;
                mdata["file"] = action.filename;
                delete mdata.data;
          
                maf["data"] = mdata;
                ctx.dispatch(new MAF.Set(maf))
            },
            (error) => {
                console.log("Unable to get MAF sheet")
                console.log(error)
            }
        )
        
    }

    @Action(MAF.AddRows)
    AddRows(ctx: StateContext<MAFStateModel>, action: MAF.AddRows) {
        this.mafService.addRows(action.filename, action.body).subscribe(
            (response) => {
                ctx.dispatch(new MAF.Organise(action.filename));
            },
            (error) => {
                console.log("Unable to add rows to MAF sheet.")
                console.log(error)
            }
        )
    }

    @Action(MAF.UpdateRows)
    UpdateRows(ctx: StateContext<MAFStateModel>, action: MAF.UpdateRows) {
        this.mafService.updateRow(action.filename, action.body).subscribe(
            (response) => {
                ctx.dispatch(new MAF.Organise(action.filename));
            },
            (error) => {
                console.log("Unable to update rows in MAF sheet.")
                console.log(error)
            }
        )
    }

    @Action(MAF.DeleteRows)
    DeleteRows(ctx: StateContext<MAFStateModel>, action: MAF.DeleteRows) {
        this.mafService.deleteRows(action.filename, action.rowIds).subscribe(
            (response) => {
                ctx.dispatch(new MAF.Organise(action.filename));
            },
            (error) => {
                console.log('Unable to delete rows from MAF sheet.')
                console.log(error)
            }
        )
    }

    @Action(MAF.UpdateCells)
    UpdateCells(ctx: StateContext<MAFStateModel>, action: MAF.UpdateCells) {
        this.mafService.updateCells(action.filename, action.cellsToUpdate).subscribe(
            (response) => {
                // do some commitUpdatedTableCellsNgxs type processing
                // or
                ctx.dispatch(new MAF.Organise(action.filename));
            },
            (error) => {
                console.log("Unable to edit cells in MAF sheet");
                console.log(error);
            }
        )
    }

    @Selector()
    static mafs(state: MAFStateModel): Record<string, any> {
        return state.mafs
    }

}