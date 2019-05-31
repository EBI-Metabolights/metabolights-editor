import { Component, OnInit, Input } from '@angular/core';
import { MetabolightsService } from '../../../../services/metabolights/metabolights.service';
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

	constructor(private fb: FormBuilder, private metabolightsService: MetabolightsService){ 
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

	asperaUpload(){
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
        this.asperaWeb.addEventListener(AW4.Connect.EVENT.STATUS, statusEventListener);
        this.asperaWeb.initSession();
        this.asperaWeb.showSelectFileDialog({
            success: (function(dataTransferObj){
                this.buildUploadSpec(dataTransferObj)
            }).bind(this),
            error: function (error) {
                console.error(error);
            }
        });
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
            // Local path
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
        var requestId = this.asperaWeb.startTransfers(finalConfig, {success: function(data){
            console.log("Upload started");
        }});
    }
}
