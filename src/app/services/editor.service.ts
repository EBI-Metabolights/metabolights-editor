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
    "Protocol REF": 5,
    "Source Name": 6
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
          this.toggleLoading(true)
          this.loadStudyId(studyID)
          this.dataService.getStudy(studyID).subscribe(
            study => {
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
              this.validateStudy()
            },
            error => {
              this.toggleLoading(true)
            }
          )
        }
      });  
    }
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
      this.dataService.getStudyFilesList(null).subscribe(data => {
        this.ngRedux.dispatch({ type: 'SET_UPLOAD_LOCATION', body: {
          'uploadLocation': data.uploadPath
        }})
        data = this.deleteProperties(data)
        this.ngRedux.dispatch({ type: 'SET_STUDY_FILES', body: data })
      })
    })
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
      this.files.study.forEach(file => {
        if(file.file.indexOf("s_") == 0 && file.status == 'active'){
          this.ngRedux.dispatch({ type: 'SET_LOADING_INFO', body: {
            'info': 'Loading Samples data' 
          }})
          this.updateSamples(file.file)
        }
      })
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
      Object.keys(mdata.header).forEach( key => {
        let fn = "element['"+ key +"']"
        mcolumns.push({
          "columnDef": key.toLowerCase().split(" ").join("_"),
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

  updateSamples(file){
    let samples = {}
    samples["name"] = file;
    this.dataService.getTable(file).subscribe(data => { 
      let columns = []
      Object.keys(data.header).forEach( key => {
        let fn = "element['"+ key +"']"
        columns.push({
          "columnDef": key,
          "sticky": "false",
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
      displayedColumns.sort((a,b) => {
        return parseInt(this.samples_columns_order[a]) - parseInt(this.samples_columns_order[b])
      })
      if(displayedColumns[1] != 'Sample Name'){
        displayedColumns.splice(displayedColumns.indexOf('Sample Name'), 1);
        displayedColumns.splice( 1, 0, 'Sample Name');
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
    });
  }

  copyStudyFiles(){
    return this.dataService.copyFiles().pipe( map( () => {
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
    return this.dataService.savePerson(body); 
  }

  // People
  getPeople(){
    return this.dataService.getPeople().pipe( map(data => { this.ngRedux.dispatch({ type: 'UPDATE_STUDY_PEOPLE', body: {
      'people': data.contacts
    }}); 
    return data 
  }));
  }

  updatePerson(email, name, body){
    return this.dataService.updatePerson(email, name, body);
  }

  deletePerson(email, name){
    return this.dataService.deletePerson(email, name);
  }

  // Ontology
  getOntologyTermDescription(value){
    return this.dataService.getOntologyDetails(value)
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
}