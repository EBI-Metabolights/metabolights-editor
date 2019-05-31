import { Component, OnInit, Input } from '@angular/core';
import { MetabolightsService } from '../../../services/metabolights/metabolights.service';
import * as toastr from 'toastr';

@Component({
    selector: 'mtbls-files',
    templateUrl: './files.component.html',
    styleUrls: ['./files.component.css']
})
export class FilesComponent implements OnInit {
    rawFiles: any[] = [];
    metaFiles: any[] = [];
    auditFiles: any[] = [];
    derivedFiles: any[] = [];
    uploadFiles: any[] = [];
    filesLoading: boolean = false;
    rawFilesLoading: boolean = false;
    validationsId = 'upload';

    filteredMetaFiles: any[] = [];
    filteredRawFiles: any[] = [];
    filteredAuditFiles: any[] = [];
    filteredDerivedFiles: any[] = [];
    filteredUploadFiles: any[] = [];

    selectedMetaFiles: any[] = [];
    selectedRawFiles: any[] = [];
    selectedAuditFiles: any[] = [];
    selectedDerivedFiles: any[] = [];
    selectedUploadFiles: any[] = [];

    isDeleteModalOpen: boolean = false;
    forceMetaDataDelete: boolean = false;

    selectedCategory: string = null;
    fileLocation: string = null;

    refreshingData: boolean = false;


    @Input('validations') validations: any;

    constructor(private metabolightsService: MetabolightsService) {}

    ngOnInit() {
        this.loadFiles()
    }

    changeforceMetaDataDeleteValue(event){
        this.forceMetaDataDelete = event.currentTarget.checked;
    }

    openDeleteConfirmation(category, fLocation){
        this.forceMetaDataDelete = false;
        this.selectedCategory = category;
        this.fileLocation = fLocation;
        this.isDeleteModalOpen = true;
    }

    closeDeleteConfirmation(){
        this.isDeleteModalOpen = false;
    }

    deleteSelected(){
        if(this.selectedCategory != null){
            if(this.selectedCategory == 'meta'){
                this.executeDelete(this.selectedMetaFiles)
            }else if(this.selectedCategory == 'audit'){
                this.executeDelete(this.selectedAuditFiles)
            }else if(this.selectedCategory == 'derived'){
                this.executeDelete(this.selectedDerivedFiles)
            }else if(this.selectedCategory == 'upload'){
                this.executeDelete(this.selectedUploadFiles)
            }else if(this.selectedCategory == 'raw'){
                this.executeDelete(this.selectedRawFiles)
            }
        }
    }

    resetData(){
        this.filteredMetaFiles = [];
        this.filteredRawFiles = [];
        this.filteredAuditFiles = [];
        this.filteredDerivedFiles = [];
        this.filteredUploadFiles = [];

        this.selectedMetaFiles = [];
        this.selectedRawFiles = [];
        this.selectedAuditFiles = [];
        this.selectedDerivedFiles = [];
        this.selectedUploadFiles = [];
    }

    executeDelete(files){
        this.metabolightsService.deleteStudyFiles(null, this.compileBody(files), this.fileLocation, this.forceMetaDataDelete).subscribe( data => {
            this.closeDeleteConfirmation()
            toastr.success('File(s) deleted successfully', "Success", {
                  "timeOut": "2500",
                  "positionClass": "toast-top-center",
                  "preventDuplicates": true,
                  "extendedTimeOut": 0,
                  "tapToDismiss": false
            })
            this.loadFilesPassively()
        })
    }

    compileBody(filesList){
        let files = []
        filesList.forEach(f=>{
            files.push({'name': f.file})
        })
        return  {'files': files};
    }

    selectFiles(event, category, file, includeAll){
        if(includeAll){
            if(event.currentTarget.checked){
                if(category == 'raw'){
                    this.selectedRawFiles = this.filteredRawFiles.slice();
                }else if(category == 'audit'){
                    this.selectedAuditFiles = this.filteredAuditFiles.slice();
                }else if(category == 'derived'){
                    this.selectedDerivedFiles = this.filteredDerivedFiles.slice();
                }else if(category == 'upload'){
                    this.selectedUploadFiles = this.filteredUploadFiles.slice();
                }else if(category == 'meta'){
                    this.selectedMetaFiles = this.filteredMetaFiles.slice();
                }
            }else{
                if(category == 'raw'){
                    this.selectedRawFiles = []
                }else if(category == 'audit'){
                    this.selectedAuditFiles = []
                }else if(category == 'derived'){
                    this.selectedDerivedFiles = []
                }else if(category == 'upload'){
                    this.selectedUploadFiles = []
                }else if(category == 'meta'){
                    this.selectedMetaFiles = []
                }
            }
        }else{
            if(event.currentTarget.checked){
                if(category == 'raw'){
                    this.selectedRawFiles = this.selectedRawFiles.concat(this.filteredRawFiles.filter(f => { return f.file == file.file}))
                }else if(category == 'audit'){
                    this.selectedAuditFiles = this.selectedAuditFiles.concat(this.filteredAuditFiles.filter(f => { return f.file == file.file}))
                }else if(category == 'derived'){
                    this.selectedDerivedFiles = this.selectedDerivedFiles.concat(this.filteredDerivedFiles.filter(f => { return f.file == file.file}))
                }else if(category == 'upload'){
                    this.selectedUploadFiles = this.selectedUploadFiles.concat(this.filteredUploadFiles.filter(f => { return f.file == file.file}))
                }else if(category == 'meta'){
                    this.selectedMetaFiles = this.selectedMetaFiles.concat(this.filteredMetaFiles.filter(f => { return f.file == file.file}))
                }
            }else{
                if(category == 'raw'){
                    var selectedFileNames = this.selectedRawFiles.map( r => r.file)
                    var indexOfSelectedFileName = selectedFileNames.indexOf(file.file)
                    if (indexOfSelectedFileName > -1) {
                       this.selectedRawFiles.splice(indexOfSelectedFileName, 1);
                    }
                }else if(category == 'audit'){
                    var selectedFileNames = this.selectedAuditFiles.map( r => r.file)
                    var indexOfSelectedFileName = selectedFileNames.indexOf(file.file)
                    if (indexOfSelectedFileName > -1) {
                       this.selectedAuditFiles.splice(indexOfSelectedFileName, 1);
                    }
                }else if(category == 'derived'){
                    var selectedFileNames = this.selectedDerivedFiles.map( r => r.file)
                    var indexOfSelectedFileName = selectedFileNames.indexOf(file.file)
                    if (indexOfSelectedFileName > -1) {
                       this.selectedDerivedFiles.splice(indexOfSelectedFileName, 1);
                    }
                }else if(category == 'upload'){
                    var selectedFileNames = this.selectedUploadFiles.length > 0 ? this.selectedUploadFiles.map( r => r.file) : []
                    if(selectedFileNames){
                        var indexOfSelectedFileName = selectedFileNames.indexOf(file.file)
                        if (indexOfSelectedFileName > -1) {
                           this.selectedUploadFiles.splice(indexOfSelectedFileName, 1);
                        }
                    }
                }else if(category == 'meta'){
                    var selectedFileNames = this.selectedMetaFiles.map( r => r.file)
                    var indexOfSelectedFileName = selectedFileNames.indexOf(file.file)
                    if (indexOfSelectedFileName > -1) {
                       this.selectedMetaFiles.splice(indexOfSelectedFileName, 1);
                    }
                }
            }
        }
    }

    decompresssFiles(files){
        let body =  { "files": [] }
        files.forEach(file => {
            if(file.type == "compressed"){
                body['files'].push({"name": file.file})   
            }
        })

        let fileNames = body['files'].map(file => file.name).join(", ")
        
        if(body['files'].length > 0){
            this.metabolightsService.decompressFiles(body).subscribe(response => {
                toastr.success('Job submitted - Started decompressing files (' + fileNames + ')' , "Success", {
                      "timeOut": "2500",
                      "positionClass": "toast-top-center",
                      "preventDuplicates": true,
                      "extendedTimeOut": 0,
                      "tapToDismiss": true
                })
                this.loadFilesPassively()
            })    
        }
        
    }

    containsZipFiles(files){
        let contains = false
        files.forEach(file => {
            if(file.type == "compressed"){
                contains = true
            }
        })
        return contains;
    }

    isChecked(filename, category){
        let isFileChecked = false
        if(category == 'raw'){
            this.selectedRawFiles.forEach(f => {
                if(f.file == filename){
                    isFileChecked = true
                }
            })
        }else if(category == 'audit'){
            this.selectedAuditFiles.forEach(f => {
                if(f.file == filename){
                    isFileChecked = true
                }
            })
        }else if(category == 'derived'){
            this.selectedDerivedFiles.forEach(f => {
                if(f.file == filename){
                    isFileChecked = true
                }
            })
        }else if(category == 'upload'){
            this.selectedUploadFiles.forEach(f => {
                if(f.file == filename){
                    isFileChecked = true
                }
            })
        }else if(category == 'meta'){
            this.selectedMetaFiles.forEach(f => {
                if(f.file == filename){
                    isFileChecked = true
                }
            })
        }
        return isFileChecked;
    }

    loadFilesPassively(){
        this.refreshingData = true;
        this.metabolightsService.getStudyFiles(null, false).subscribe( data => {
            this.resetData();
            this.uploadFiles = data.latest;
            this.filteredUploadFiles = this.uploadFiles
            this.rawFiles = []
            this.metaFiles = []
            this.auditFiles = []
            this.derivedFiles = []
            this.refreshingData = false;
            data.study.forEach( file => {
                if(file.type == 'unknown' || file.type == 'compressed' || file.type == 'derived' ){
                    this.rawFiles.push(file)
                    this.filteredRawFiles.push(file)
                }else if(file.type.indexOf('metadata') > -1){
                    this.metaFiles.push(file)
                    this.filteredMetaFiles.push(file)
                }else if(file.type == 'audit'){
                    this.auditFiles.push(file)
                    this.filteredAuditFiles.push(file)
                }else if(file.type == 'internal_mapping' || file.type == 'spreadsheet'){
                    this.derivedFiles.push(file)
                    this.filteredDerivedFiles.push(file)
                }
            })
            this.rawFilesLoading = true;
            this.metabolightsService.getStudyFilesList(null).subscribe( data => {
                data.study.forEach( file => {
                    if(file.type == 'unknown' || file.type == 'compressed' || file.type == 'derived' ){
                        this.rawFiles.push(file)
                        this.filteredRawFiles.push(file)
                    }
                })
                this.rawFilesLoading = false;
            })
        })
    }

    loadFiles(){
        this.resetData()
        this.filesLoading = true;
        this.rawFilesLoading = true;
        this.refreshingData = true;
        this.metabolightsService.getStudyFiles(null, false).subscribe( data => {
            this.uploadFiles = data.latest;
            this.filteredUploadFiles = this.uploadFiles
            this.filesLoading = false;
            this.refreshingData = false;
            data.study.forEach( file => {
                if(file.type == 'unknown' || file.type == 'compressed' || file.type == 'derived' ){
                    this.rawFiles.push(file)
                    this.filteredRawFiles.push(file)
                }else if(file.type.indexOf('metadata') > -1){
                    this.metaFiles.push(file)
                    this.filteredMetaFiles.push(file)
                }else if(file.type == 'audit'){
                    this.auditFiles.push(file)
                    this.filteredAuditFiles.push(file)
                }else if(file.type == 'internal_mapping' || file.type == 'spreadsheet'){
                    this.derivedFiles.push(file)
                    this.filteredDerivedFiles.push(file)
                }
            })
        })

        this.rawFilesLoading = true;
        this.metabolightsService.getStudyFilesList(null).subscribe( data => {
            data.study.forEach( file => {
            if(file.type == 'unknown' || file.type == 'compressed' || file.type == 'derived' ){
                this.rawFiles.push(file)
                this.filteredRawFiles.push(file)
            }
            })
            this.rawFilesLoading = false;
        })

    }

    applyFilter(event, target){
        let term =  event.target.value
        if(target == 'meta'){
             this.filteredMetaFiles = this.Afilter(term, this.metaFiles)
        }else if(target == 'audit'){
            this.filteredAuditFiles = this.Afilter(term, this.auditFiles)
        }else if(target == 'raw'){
            this.filteredRawFiles = this.Afilter(term, this.rawFiles)
        }else if(target == 'derived'){
            this.filteredDerivedFiles = this.Afilter(term, this.derivedFiles)
        }else if(target == 'upload'){
            this.filteredUploadFiles = this.Afilter(term, this.uploadFiles)
        }
    }

    Afilter(term, source){
        let target = []
        if(term == ''){
            target = source
            return target
        }else{
            target = source.filter( t => {
                return t.file.toLowerCase().indexOf(term.toLowerCase()) > -1
            })
            return target
        }
    }

    copyFiles(){
        this.metabolightsService.copyFiles().subscribe( data => {
            toastr.success('Files synced successfully', "Success", {
                  "timeOut": "2500",
                  "positionClass": "toast-top-center",
                  "preventDuplicates": true,
                  "extendedTimeOut": 0,
                  "tapToDismiss": false
              })
        })
    }

    isFolder(file){
        return !(file.file.indexOf(".") > -1)
    }

    get validation() {
        return this.validations[this.validationsId];
    }
}
