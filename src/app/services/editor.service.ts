import { Injectable } from "@angular/core";
import { Http } from "@angular/http";
import { MetabolightsService } from './../services/metabolights/metabolights.service';
import { AuthService } from './../services/metabolights/auth.service';
import { DOIService } from './../services/publications/doi.service';
import { EuropePMCService } from './../services/publications/europePMC.service';
import { IAppState } from './../store';
import { NgRedux, select } from '@angular-redux/store';
import { Router, ActivatedRoute} from "@angular/router";
import { Observable } from 'rxjs';

import { map, catchError } from 'rxjs/operators';

import { LoginURL, RedirectURL } from './../services/globals';
import { contentHeaders } from './../services/headers';
import Swal from 'sweetalert2';

@Injectable({
	providedIn: 'root'
})
export class EditorService {
  @select(state => state.study.identifier) studyIdentifier; 
  @select(state => state.study.validations) studyValidations; 
  @select(state => state.study.files) studyFiles; 

  redirectUrl: string = RedirectURL;
  currentStudyIdentifier: string = null;
  validations: any = {};
  files: any = [];
  samples_columns_order:any = {
    "Sample Name" : 1,
    "Characteristics[Organism]": 2,
    "Characteristics[Organism part]": 3,
    "Characteristics[Variant]": 4,
    "Characteristics[Sample type]": 5,
    "Protocol REF": 6,
    "Source Name": 7
  }

  constructor(private ngRedux: NgRedux<IAppState>, private router: Router, private doiService: DOIService, private authService: AuthService, private europePMCService: EuropePMCService, private dataService: MetabolightsService) {
    this.studyIdentifier.subscribe(value => { 
        this.currentStudyIdentifier = value 
    });
    this.studyValidations.subscribe(value => { 
      this.validations = value;
    });
    this.studyFiles.subscribe(value => { 
      this.files = value;
    });
  }

  login(body){
    return this.authService.login(body);
  }

  logout(){
    localStorage.removeItem('user');
    this.router.navigate([LoginURL]);
  }

  authenticateAPIToken(body){
    return this.authService.authenticateToken(body);
  }

  getValidatedJWTUser(body){
    return this.authService.getValidatedJWTUser(body);
  }

  metaInfo(){
    return this.dataService.getMetaInfo();
  }

  loadStudyInReview(id){
    this.loadStudyId(id);
    this.loadStudy(id, true)
    this.loadValidations()
  }

  loadPublicStudy(body){
    this.loadStudyId(body.id);
    this.loadStudy(body.id, true)
    this.loadValidations()
  }

  initialise(data, signInRequest){
    let user = null
    if(signInRequest){
      user = JSON.parse(data.content).owner; 
      localStorage.setItem('user', JSON.stringify(user));
      contentHeaders.set('user_token', user.apiToken);
      this.ngRedux.dispatch({ 
        type: 'INITIALISE' 
      })
      this.ngRedux.dispatch({ type: 'SET_USER', body: {
        'user': user
      }})
      this.ngRedux.dispatch({ type: 'SET_USER_STUDIES', body: {
        'studies': null
      }})
      this.loadValidations();
      return true;
    }else{
      user = JSON.parse(data)
      contentHeaders.set('user_token', user.apiToken);
      this.ngRedux.dispatch({ 
        type: 'INITIALISE' 
      })
      this.ngRedux.dispatch({ type: 'SET_USER', body: {
        'user': user
      }})
      this.ngRedux.dispatch({ type: 'SET_USER_STUDIES', body: {
        'studies': null
      }})
      this.loadValidations();
      return true;
    }
  }

  loadValidations(){
    this.dataService.getValidations().subscribe( 
      validations => {
        this.ngRedux.dispatch({ type: 'SET_LOADING_INFO', body: {
          'info': 'Loading study validations' 
        }})
        this.ngRedux.dispatch({ 
          type: 'LOAD_VALIDATION_RULES', 
          body: {
            'validations': validations
          }
        })
      }, 
      err => { 
        console.log(err) 
      }
    );
  }

  refreshValidations(){
    return this.dataService.refreshValidations()
  }

  overrideValidations(data){
    return this.dataService.overrideValidations(data);
  }

  loadGuides(){
    this.dataService.getLanguageMappings().subscribe( 
      mappings => {
        this.ngRedux.dispatch({ type: 'SET_GUIDES_MAPPINGS', body: {
          'mappings': mappings 
        }})
        var selected_language = localStorage.getItem('selected_language');
        mappings['languages'].forEach( language => {
          if((selected_language && language['code'] == selected_language) || (!selected_language && language['default'])){
            this.ngRedux.dispatch({ 
              type: 'SET_SELECTED_LANGUAGE', 
              body: {
                'language': language['code']
              }
            })

            this.dataService.getGuides(language['code']).subscribe( 
              guides => {
                this.ngRedux.dispatch({ 
                  type: 'SET_GUIDES', 
                  body: {
                    'guides': guides['data']
                  }
                })
            })
          }
        })
        
      }, 
      err => { 
        console.log(err) 
      }
    );
  }

  loadLanguage(language){
    this.dataService.getGuides(language).subscribe( 
      guides => {
        localStorage.setItem('selected_language', language);
        this.ngRedux.dispatch({ 
          type: 'SET_SELECTED_LANGUAGE', 
          body: {
            'language': language
          }
        })
        this.ngRedux.dispatch({ 
          type: 'SET_GUIDES', 
          body: {
            'guides': guides['data']
          }
        })
    })
  }

  getAllStudies(){
    this.dataService.getAllStudies().subscribe( response => {
      this.ngRedux.dispatch({ type: 'SET_USER_STUDIES', body: {
        'studies': response.data
      }})
    });
  }

  loadStudyId(id){
    return this.ngRedux.dispatch({ type: 'SET_STUDY_IDENTIFIER', body: {
      'study': id
    }})          
  }

  createStudy(){
    return this.dataService.createStudy()
  }

  toggleLoading(status){
    if(status != null){
      if(status){
        this.ngRedux.dispatch({ type: 'ENABLE_LOADING' })
      }else{
        this.ngRedux.dispatch({ type: 'DISABLE_LOADING' })
      }
    }else{
      this.ngRedux.dispatch({ type: 'TOGGLE_LOADING' })  
    }
  }

  initialiseStudy(route){
    if(route == null){
      return this.loadStudyId(null)
    }else{
      route.params.subscribe( params => {
        let studyID = params['id']
        if(this.currentStudyIdentifier != studyID ){
          this.loadStudy(studyID, false)
        }
      });  
    }
  }

  toggleProtocolsExpand(value){
    this.ngRedux.dispatch({ type: 'SET_PROTOCOL_EXPAND', body: value})
  }

  loadStudy(studyID, readonly){
    this.toggleLoading(true)
    this.loadStudyId(studyID)
    this.dataService.getStudy(studyID).subscribe(
      study => {
        this.ngRedux.dispatch({ type: 'SET_STUDY_ERROR', body: {
          'investigationFailed': false
        }})
        this.ngRedux.dispatch({ type: 'SET_LOADING_INFO', body: {
          'info': 'Loading investigation details' 
        }})
        this.ngRedux.dispatch({ type: 'SET_CONFIGURATION', body: {
          'configuration': study.isaInvestigation.comments
        }})
        this.ngRedux.dispatch({ type: 'SET_STUDY_TITLE', body: {
          'title': study.isaInvestigation.studies[0].title
        }})
        this.ngRedux.dispatch({ type: 'SET_STUDY_ABSTRACT', body: {
          'description': study.isaInvestigation.studies[0].description
        }})
        this.ngRedux.dispatch({ type: 'SET_STUDY_SUBMISSION_DATE', body: {
          'study': study
        }})
        this.ngRedux.dispatch({ type: 'SET_STUDY_RELEASE_DATE', body: {
          'study': study
        }})
        this.ngRedux.dispatch({ type: 'SET_STUDY_STATUS', body: {
          'study': study
        }})
        this.ngRedux.dispatch({ type: 'SET_STUDY_REVIEWER_LINK', body: {
          'study': study
        }})
        this.ngRedux.dispatch({ type: 'SET_STUDY_PUBLICATIONS', body: {
          'study': study
        }})
        this.ngRedux.dispatch({ type: 'SET_STUDY_PEOPLE', body: {
          'study': study
        }})
        this.ngRedux.dispatch({ type: 'SET_STUDY_DESIGN_DESCRIPTORS', body: {
          'studyDesignDescriptors': study.isaInvestigation.studies[0].studyDesignDescriptors
        }})
        this.ngRedux.dispatch({ type: 'SET_STUDY_FACTORS', body: {
          'factors': study.isaInvestigation.studies[0].factors
        }})
        this.ngRedux.dispatch({ type: 'SET_STUDY_PROTOCOLS', body: {
          'protocols': study.isaInvestigation.studies[0].protocols
        }})
        this.loadStudyFiles()
        if(!readonly){
          this.validateStudy()
          this.ngRedux.dispatch({ type: 'SET_STUDY_READONLY', body: {
            'readonly': false
          }})
        }else{
          this.ngRedux.dispatch({ type: 'SET_STUDY_READONLY', body: {
            'readonly': true
          }})
          this.toggleLoading(false)
        }
      },
      error => {
        this.toggleLoading(false)
        this.ngRedux.dispatch({ type: 'SET_STUDY_ERROR', body: {
          'investigationFailed': true
        }})
        this.loadStudyFiles()
        if(!readonly){
          this.validateStudy()
        }
      }
    )
  }

  validateStudy(){
    this.dataService.validateStudy(null, null).subscribe(response => {
        this.toggleLoading(false)
        this.ngRedux.dispatch({ type: 'SET_STUDY_VALIDATION', body: {
            'validation': response.validation
        }})
    }, error => {
      this.toggleLoading(false)
    })
  }

  loadStudyFiles(){
    this.dataService.getStudyFiles(null, true).subscribe(data => {
      this.ngRedux.dispatch({ type: 'SET_UPLOAD_LOCATION', body: {
        'uploadLocation': data.uploadPath
      }})
      this.ngRedux.dispatch({ type: 'SET_OBFUSCATION_CODE', body: {
        'obfuscationCode': data.obfuscationCode
      }})
      data = this.deleteProperties(data)
      this.ngRedux.dispatch({ type: 'SET_STUDY_FILES', body: data })
      this.loadStudySamples()
      this.loadStudyAssays(data)
    }, error => {
      this.dataService.getStudyFilesList(null, null, null, null).subscribe(data => {
        this.ngRedux.dispatch({ type: 'SET_UPLOAD_LOCATION', body: {
          'uploadLocation': data.uploadPath
        }})
        this.ngRedux.dispatch({ type: 'SET_OBFUSCATION_CODE', body: {
          'obfuscationCode': data.obfuscationCode
        }})
        data = this.deleteProperties(data)
        this.ngRedux.dispatch({ type: 'SET_STUDY_FILES', body: data })
      })
    })
  }

  loadStudyProtocols(){
    this.dataService.getProtocols(null).subscribe( data => {
      this.ngRedux.dispatch({ type: 'SET_STUDY_PROTOCOLS', body: {
        'protocols': data.protocols
      }})
    })
  }

  deleteStudyFiles(id, body, location, force) {
    return this.dataService.deleteStudyFiles(id, body, location, force)
  }

  deleteStudy(id) {
    return this.dataService.deleteStudy(id)
  }

  decompressFiles(body) {
    return this.dataService.decompressFiles(body)
  }

  getStudyFiles(id, includeRawFiles){
    return this.dataService.getStudyFiles(id, includeRawFiles)
  }

  getStudyFilesList(id, include_sub_dir, dir) {
    return this.dataService.getStudyFilesList(id, include_sub_dir, dir, null)
  }

  syncFiles(data){
    return this.dataService.syncFiles(data)
  }

  loadStudyDirectory(dir, parent){
      return this.dataService.getStudyFilesList(null, false, dir, parent)
  }

  extractAssayDetails(assay){
    if((assay.name.split(this.currentStudyIdentifier)[1])){
      let assayInfo = (assay.name.split(this.currentStudyIdentifier)[1]).split("_");
      let assaySubTechnique = null
      let assayTechnique = null
      let assayMainTechnique = null
      this.validations['assays']['assaySetup'].main_techniques.forEach(mt => {
        mt.techniques.forEach(t => {
          if( t.sub_techniques && t.sub_techniques.length > 0){
            t.sub_techniques.forEach(st => {
              if(st.template == assayInfo[1]){
                assaySubTechnique = st
                assayTechnique = t
                assayMainTechnique = mt
              }
            })
          }
        })
      })
      return {
        "assaySubTechnique" : assaySubTechnique,
        "assayTechnique" : assayTechnique,
        "assayMainTechnique" : assayMainTechnique
      };
    }
    return {
      "assaySubTechnique" : '',
      "assayTechnique" : '',
      "assayMainTechnique" : ''
    }
  }

  loadStudySamples(){
    if(this.files == null){
      this.loadStudyFiles()
    }else{
      let samplesExist =false
      this.files.study.forEach(file => {
        if(file.file.indexOf("s_") == 0 && file.status == 'active'){
          this.ngRedux.dispatch({ type: 'SET_LOADING_INFO', body: {
            'info': 'Loading Samples data' 
          }})
          samplesExist = true
          this.updateSamples(file.file)
        }
      })
      if(!samplesExist){
        Swal.fire({
          title: "Error",
          text: "Sample sheet missing. Please upload sample sheet.",
          showCancelButton: false,
          confirmButtonColor: "#DD6B55",
          confirmButtonText: "OK",
        })
      }
    }
  }

  loadStudyAssays(files){
    this.ngRedux.dispatch({ type: 'SET_LOADING_INFO', body: {
      'info': 'Loading assays information' 
    }})
    files.study.forEach(file => {
      if(file.file.indexOf("a_") == 0 && file.status == 'active'){      
        this.updateAssay(file.file)
      }
    })
  }

  updateTableState(filename, tableType, metaInfo){
    if(tableType == 'samples'){
      this.updateSamples(filename)
    }else if(tableType == 'assays'){
      this.updateAssay(filename)
    }else if(tableType == 'maf'){
      this.updateMAF(filename)
    }
  }

  updateAssay(file){
    this.dataService.getTable(file).subscribe(data => { 
      let assay = {}
      assay["name"] = file;
      assay['meta'] = this.extractAssayDetails(assay)
      let columns = []
      Object.keys(data.header).forEach( key => {
        let fn = "element['"+ key +"']"
        columns.push({
          "columnDef": key,
          "sticky": "false",
          "header": key,
          "cell": (element) => eval(fn)
        })
      });
      let displayedColumns = columns.map( a => { return a.columnDef } )
      displayedColumns.unshift("Select")
      displayedColumns = displayedColumns.filter( key => {
        return (key.indexOf("Term Accession Number") < 0 && key.indexOf("Term Source REF") < 0)
      })
      data['columns'] = columns;
      data['displayedColumns'] = displayedColumns;
      data['file'] = file;
      data['rows'] = data.data.rows;
      delete data['data']
      assay['data'] = data
      let protocols = []
      protocols.push("Sample collection")
      if(data['rows'].length > 0){
        columns.forEach(c => {
          if(c.header.indexOf("Protocol REF") > -1){
            protocols.push(data['rows'][0][c.header])
          }
        })  
      }
      assay['protocols'] = protocols

      let mafFiles = []
      data.rows.forEach( row => {
        let mafFile = row['Metabolite Assignment File'].replace(/^[ ]+|[ ]+$/g,'')
        if(mafFile != "" && mafFiles.indexOf(mafFile) < 0){
          mafFiles.push(mafFile);
        }
      })    
      mafFiles.forEach( f => {
        this.updateMAF(f);
      })
      assay['mafs'] = mafFiles
      this.ngRedux.dispatch({ type: 'SET_STUDY_ASSAY', body: assay});
    });
  }

  updateMAF(f){
    this.dataService.getTable(f).subscribe(mdata => {
      let mcolumns = []
      let maf = {}


      mcolumns.push({
        "columnDef": "Structure",
        "sticky": "true",
        "header": "Structure",
        "structure" : true,
        "cell": (element) => eval("element['database_identifier']")
      })

      Object.keys(mdata.header).forEach( key => {
        let fn = "element['"+ key +"']"
        mcolumns.push({
          "columnDef": key, //.toLowerCase().split(" ").join("_")
          "sticky": "false",
          "header": key,
          "cell": (element) => eval(fn)
        })
      })

      let mdisplayedColumns = mcolumns.map( a => { return a.columnDef } )
      mdisplayedColumns.unshift("Select")
      mdisplayedColumns.sort(function(a, b){  
        return parseInt(mdata.header[a]) - parseInt(mdata.header[b]);
      });
      mdisplayedColumns = mdisplayedColumns.filter( key => {
        return (key.indexOf("Term Accession Number") < 0 && key.indexOf("Term Source REF") < 0)
      })

      mdata['columns'] = mcolumns;
      mdata['displayedColumns'] = mdisplayedColumns;
      mdata['rows'] = mdata.data.rows;
      mdata['file'] = f;
      delete mdata['data']

      maf['data'] = mdata
      this.ngRedux.dispatch({ type: 'SET_STUDY_MAF', body: maf});        
    })
  }

  search(term, type) {
    return this.dataService.search(term, type).pipe(map( data => {
      return data
    }))
  }

  validateMAF(f){
    return this.dataService.validateMAF(f).pipe(map( data => {
      return data
    }))
  }

  updateSamples(file){
    let samples = {}
    samples["name"] = file;
    this.dataService.getTable(file).subscribe(data => { 
      let columns = []
      Object.keys(data.header).forEach( key => {
        let fn = "element['"+ key +"']"
        columns.push({
          "columnDef": key,
          "sticky": key == "Protocol REF" ? "true" : "false",
          "header": key,
          "cell": (element) => eval(fn)
        })
      })
      let displayedColumns = columns.map( a => { return a.columnDef } )
      displayedColumns.unshift("Select")
      displayedColumns.sort(function(a, b){  
        return parseInt(data.header[a]) - parseInt(data.header[b]);
      });
      var index = displayedColumns.indexOf("Source Name");
      if (index > -1) {
        displayedColumns.splice(index, 1);
      }

      var index = displayedColumns.indexOf("Characteristics[Sample type]");
      if (index > -1) {
        displayedColumns.splice(index, 1);
      }

      displayedColumns.sort((a,b) => {
        return parseInt(this.samples_columns_order[a]) - parseInt(this.samples_columns_order[b])
      })

      if(displayedColumns[1] != 'Protocol REF'){
        displayedColumns.splice(displayedColumns.indexOf('Protocol REF'), 1);
        displayedColumns.splice( 1, 0, 'Protocol REF');
      }
      
      if(displayedColumns[2] != 'Sample Name'){
        displayedColumns.splice(displayedColumns.indexOf('Sample Name'), 1);
        displayedColumns.splice( 2, 0, 'Sample Name');
      }
      displayedColumns = displayedColumns.filter( key => {
        return (key.indexOf("Term Accession Number") < 0 && key.indexOf("Term Source REF") < 0)
      })
      data['columns'] = columns;
      data['displayedColumns'] = displayedColumns;
      data['file'] = file;
      data['rows'] = data.data.rows;
      delete data['data']
      samples['data'] = data
      this.ngRedux.dispatch({ type: 'SET_STUDY_SAMPLES', body: samples});

      let organisms = {}
      data['rows'].forEach (row =>{
          let organismName = row['Characteristics[Organism]'].replace(/^[ ]+|[ ]+$/g,'')
          let organismPart = row['Characteristics[Organism part]']
          let organismVariant = row['Characteristics[Variant]']
          if(organismName != '' && organismName.replace(" ", '') != ''){
              if(organisms[organismName] == null){
                  organisms[organismName] = {
                      "parts" : [],
                      "variants" : []
                  }
              }else{
                  if(organisms[organismName]['parts'].indexOf(organismPart) < 0){organisms[organismName]['parts'].push(organismPart)}
                  if(organisms[organismName]['variants'].indexOf(organismVariant) < 0){organisms[organismName]['variants'].push(organismVariant)}
              }
          }
      })
      this.ngRedux.dispatch({ type: 'SET_STUDY_ORGANISMS', body: {
          'organisms': organisms
      }})
    }, err => {
    });
  }

  copyStudyFiles(){
    return this.dataService.copyFiles().pipe( map( () => {
      return this.loadStudyFiles()
    }))
  }

  syncStudyFiles(data){
    return this.dataService.syncFiles(data).pipe( map( () => {
      return this.loadStudyFiles()
    }))
  }

  deleteProperties(data){
    delete data.obfuscationCode
    delete data.uploadPath
    return data
  }

  // Meta data
  saveTitle(body){
    return this.dataService.saveTitle(body).pipe( map(data => {this.ngRedux.dispatch({ type: 'SET_STUDY_TITLE', body: data}); return data}));
  }

  saveAbstract(body){
    return this.dataService.saveAbstract(body).pipe(map( data => { this.ngRedux.dispatch({ type: 'SET_STUDY_ABSTRACT', body: data}); return data} ));
  }

  savePerson(body){
    return this.dataService.savePerson(body).pipe( map(data => { this.ngRedux.dispatch({ type: 'UPDATE_STUDY_PEOPLE', body: {
      'people': data.contacts
      }});
    }));
  }

  // People
  getPeople(){
    return this.dataService.getPeople().pipe( map(data => { this.ngRedux.dispatch({ type: 'UPDATE_STUDY_PEOPLE', body: {
      'people': data.contacts
      }});
    }));
  }

  updatePerson(email, name, body){
    return this.dataService.updatePerson(email, name, body);
  }

  makePersonSubmitter(email, study){
    return this.dataService.makePersonSubmitter(email, study);
  }

  deletePerson(email, name){
    return this.dataService.deletePerson(email, name);
  }

  // Ontology
  getOntologyTermDescription(value){
    return this.dataService.getOntologyTermDescription(value)
  }

  getOntologyTerms(url){
    return this.dataService.getOntologyTerms(url)
  }

  getOntologyDetails(value){
    return this.dataService.getOntologyDetails(value)
  }

  // Study Design Descriptors
  getDesignDescriptors() {
    return this.dataService.getDesignDescriptors()
  }

  saveDesignDescriptor(body) {
    return this.dataService.saveDesignDescriptor(body)
  }

  updateDesignDescriptor(annotationValue, body) {
    return this.dataService.updateDesignDescriptor(annotationValue, body)
  }

  deleteDesignDescriptor(annotationValue) {
    return this.dataService.deleteDesignDescriptor(annotationValue)
  }

  // Assays
  addAssay(body) {
    return this.dataService.addAssay(body).pipe(
      map( data => {
        return data
      })
    );
  }

  deleteAssay(name) {
    return this.dataService.deleteAssay(name).pipe(
      map( data => {
        this.ngRedux.dispatch({ type: 'DELETE_STUDY_ASSAY', body: name});
        return data
      })
      );
  }

  // Protocols
  getProtocols(id) {
    return this.dataService.getProtocols(id).pipe(map( data => { 
      this.ngRedux.dispatch({ type: 'SET_STUDY_PROTOCOLS', body: data})
      return data 
    }))
  }

  saveProtocol(body) {
    return this.dataService.saveProtocol(body)
  }

  updateProtocol(title, body) {
    return this.dataService.updateProtocol(title, body)
  }

  deleteProtocol(title) {
    return this.dataService.deleteProtocol(title)
  }

  // Ontology
  getExactMatchOntologyTerm(term, branch){
    return this.dataService.getExactMatchOntologyTerm(term, branch)
  }

  // Study factors
  getFactors() {
    return this.dataService.getFactors().pipe( map( data => {
      this.ngRedux.dispatch({ type: 'UPDATE_STUDY_FACTORS', body: {
        'factors': data.factors
      }})
      return data
    }))
  }

  saveFactor(body) {
    return this.dataService.saveFactor(body)
  }

  updateFactor(factorName, body) {
    return this.dataService.updateFactor(factorName, body)
  }

  deleteFactor(factorName) {
    return this.dataService.deleteFactor(factorName)
  }

  // table 
  addColumns(filename, body, tableType, metaInfo) {
    return this.dataService.addColumns(filename, body).pipe(map(data => {
      this.updateTableState(filename, tableType, metaInfo)
      return data
    }))
  }

  addRows(filename, body, tableType, metaInfo) {
    return this.dataService.addRows(filename, body).pipe(map(data => {
      this.updateTableState(filename, tableType, metaInfo)
      return data
    }))
  }

  updateRows(filename, body, tableType, metaInfo) {
    return this.dataService.updateRows(filename, body).pipe(map(data => {
      this.updateTableState(filename, tableType, metaInfo)
      return data
    }))
  }

  deleteRows(filename, rowIds, tableType, metaInfo) {
    return this.dataService.deleteRows(filename, rowIds).pipe( map(data => {
      this.updateTableState(filename, tableType, metaInfo)
      return data
    }));
  }

  updateCells(filename, body, tableType, metaInfo){
    return this.dataService.updateCells(filename, body).pipe( map(data => {
      this.updateTableState(filename, tableType, metaInfo)
      return data
    }));
  }

  //Publications
  getPublications(){
    return this.dataService.getPublications().pipe( map(data => {
      this.ngRedux.dispatch({ type: 'UPDATE_STUDY_PUBLICATIONS', body: {
        'publications': data.publications
       }})
      return data
    }));
  }
  
  savePublication(body){
    return this.dataService.savePublication(body);
  }

  updatePublication(title, body) {
    return this.dataService.updatePublication(title, body)
  }

  deletePublication(title) {
    return this.dataService.deletePublication(title)
  }

  //Status change
  changeStatus(status) {
    return this.dataService.changeStatus(status)
  }

  getStudyPrivateFolderAccess(){
    return this.dataService.getStudyPrivateFolderAccess()
  }

  toggleFolderAccess(){
    return this.dataService.toggleFolderAccess()
  }

  // Release date change
  changeReleasedate(releaseDate){
    return this.dataService.changeReleasedate(releaseDate)
  }
}