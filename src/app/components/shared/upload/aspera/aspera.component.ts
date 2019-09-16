import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { EditorService } from '../../../../services/editor.service';
import { NgRedux, select } from '@angular-redux/store';
import { FormBuilder, FormGroup, Validators} from '@angular/forms';
import * as toastr from 'toastr';

declare var $: any;
declare var AW4: any;

@Component({
	selector: 'mtbls-aspera',
	templateUrl: './aspera.component.html',
	styleUrls: ['./aspera.component.css']
})
export class AsperaComponent implements OnInit {

	isAsperaUploadModalOpen: boolean = false;
	selectedTab: string = 'plugin';
	@select(state => state.study.uploadLocation) uploadLocation;
    displayHelpModal: boolean = false;

    @Input('file') file: string = null;
    @Input('allowMultipleSelection') allowMultipleSelection: boolean = true;
    @Input('type') type: string = 'file';

    @Input('fileTypes') fileTypes: any = null;

    @Output() complete = new EventEmitter<any>();

    currentTransferId = null;

	validationsId = 'upload';
    @select(state => state.study.validations) validations: any
    validation: any;

	$: any;
    MIN_CONNECT_VERSION = "3.6.0.0";
    CONNECT_AUTOINSTALL_LOCATION = "//d3gcli72yxqn2z.cloudfront.net/connect/v4";
    //CONNECT_LOCATION = "http://asperasoft.com/connect2";
    //connect_id = "aspera-web";
    asperaWeb: any; 
    uploadPath: string = '';

	constructor(private fb: FormBuilder, private editorService: EditorService){ 
		this.uploadLocation.subscribe(value => { 
			this.uploadPath = value
		})
        this.validations.subscribe(value => { 
            if(value){
                this.validation = value[this.validationsId]
            }
        })
	}

    toggleHelp() {
        this.displayHelpModal = !this.displayHelpModal;
    }

	ngOnInit() {
	}

	changeTab(id){
		this.selectedTab = id;
	}

	openUploadModal(){
		this.isAsperaUploadModalOpen = true;
	}

	closeUploadModal(){
		this.isAsperaUploadModalOpen = false;	
    }
    
    upload(type){
        this.asperaUpload(type)
    }

	asperaUpload(type){
        this.asperaWeb = new AW4.Connect({sdkLocation: this.CONNECT_AUTOINSTALL_LOCATION, minVersion: this.MIN_CONNECT_VERSION});
        var connectInstaller = new AW4.ConnectInstaller({sdkLocation : this.CONNECT_AUTOINSTALL_LOCATION});
        var statusEventListener = function (eventType, data) {
            if (eventType === AW4.Connect.EVENT.STATUS && data == AW4.Connect.STATUS.INITIALIZING) {
                connectInstaller.showLaunching();
            } else if (eventType === AW4.Connect.EVENT.STATUS && data == AW4.Connect.STATUS.FAILED) {
                connectInstaller.showDownload();
            } else if (eventType === AW4.Connect.EVENT.STATUS && data == AW4.Connect.STATUS.OUTDATED) {
                connectInstaller.showUpdate();
            } else if (eventType === AW4.Connect.EVENT.STATUS && data == AW4.Connect.STATUS.RUNNING) {
                connectInstaller.connected();
            }
        };
        var transferStatusListener = (function(eventType, data){
            if (eventType === AW4.Connect.EVENT.TRANSFER) {
                data.transfers.forEach(transfer => {
                    if(transfer.uuid == this.currentTransferId){
                       if(transfer.status == "completed"){
                           console.log("Upload completed")
                           console.log("Sync started")
                           console.log(this.file)
                            if(this.allowMultipleSelection){
                                this.editorService.syncStudyFiles({
                                    files: []
                                }).subscribe(data => {
                                    this.closeUploadModal();
                                    this.complete.emit();
                                    console.log("Sync complete")
                                })
                            }else{
                                this.editorService.syncStudyFiles({
                                    files: [ {
                                            from: transfer['transfer_spec'].paths[0].source.split('\\').pop().split('/').pop(),
                                            to : this.file
                                        }
                                    ]
                                }).subscribe(data => {
                                    this.closeUploadModal();
                                    this.complete.emit();
                                    console.log("Sync complete")
                                })
                            }
                       }
                    }
                })
            } 
        }).bind(this)
        this.asperaWeb.addEventListener(AW4.Connect.EVENT.STATUS, statusEventListener);
        this.asperaWeb.addEventListener(AW4.Connect.EVENT.TRANSFER, transferStatusListener);
        this.asperaWeb.initSession();
        if(type == 'folder'){
            this.asperaWeb.showSelectFolderDialog({
                success: (function(dataTransferObj){
                    this.buildUploadSpec(dataTransferObj)
                }).bind(this),
                error: function (error) {
                    console.error(error);
                }
            }, {
                allowMultipleSelection : this.allowMultipleSelection
            });
        }else{
            console.log(this.fileTypes)
            this.asperaWeb.showSelectFileDialog({
                success: (function(dataTransferObj){
                    this.buildUploadSpec(dataTransferObj)
                }).bind(this),
                error: function (error) {
                    console.error(error);
                }
            }, {
                allowMultipleSelection : this.allowMultipleSelection,
                allowedFileTypes : this.fileTypes
            });
        }
    }

    buildUploadSpec(dataTransferObj) {
        var transferSpecs = [{
            "aspera_connect_settings": {
                "allow_dialogs": true,
                "back_link": location.href
            },
            "transfer_spec": {}
        }]

        var params = {}
        var asperaSettings = this.validation.aspera;
        params["remote_user"] = asperaSettings.user;
        params["remote_password"] = asperaSettings.secret;
        params['remote_host'] =  asperaSettings.server;

        // params['fasp_port'] = 33001;
        params['target_rate_kbps'] = 45000;
        params['min_rate_kbps'] = 0;
        params['lock_policy'] = false;
        params['lock_target_rate'] = false;
        params['direction'] = "send";
        params['lock_min_rate'] = false;
        params['rate_policy'] = "fair";
        params['cipher'] = "aes-128";
        params['ssh_port'] = 33001;

        transferSpecs[0]["transfer_spec"] = params;

        transferSpecs[0]["transfer_spec"]['paths'] = [];
        var files = dataTransferObj.dataTransfer.files;
        for (var i = 0, length = files.length; i < length; i += 1) {
            var pathSet = {src : files[i].name};
            var srcPath = pathSet.src || '';
            var destPath = '';
            var paths = transferSpecs[0]["transfer_spec"]['paths'];
            if (!paths) {
                transferSpecs[0]["transfer_spec"]['paths'] = [];
            }
            (transferSpecs[0]["transfer_spec"]['paths']).push({
                'source': srcPath,
                'destination': destPath
            });
        }
        transferSpecs[0]["transfer_spec"]['destination_root'] = this.uploadPath ;

        var finalConfig = {};
        finalConfig['transfer_specs'] = transferSpecs;
        var requestId = this.asperaWeb.startTransfers(finalConfig, {success: data => {
            this.currentTransferId = data['transfer_specs'][0]['uuid']
            console.log("Upload Started")
        }});
    }
}
