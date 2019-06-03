
# Metabolights Editor
[MetaboLights](https://www.ebi.ac.uk/metabolights) is a database for Metabolomics experiments and derived information. The database is cross-species, cross-technique and covers metabolite structures and their reference spectra as well as their biological roles, locations and concentrations, and experimental data from metabolic experiments. 

MetaboLights - Online Editor is a Single Page Application (SPA) built upon Angular 7, and Redux framework provides MetaboLights users and curators with an intuitive and easy to use interface to create, edit and annotate their studies online.

### Browser Compatibility

MetaboLights Editor supports all browsers that are  [ES5-compliant](http://kangax.github.io/compat-table/es5/)  (IE8 and below are not supported).

### [Documentation](https://github.com/EBI-Metabolights/metabolights-editor/wiki) 

(coming soon)


### [Issues](https://github.com/EBI-Metabolights/metabolights-editor/issues)
Please report the issues here - https://github.com/EBI-Metabolights/metabolights-editor/issues

## Development

### Development server

- Install angular CLI to get started

- Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

Editor by default connects to [MetaboLights DEV](https://wwwdev.ebi.ac.uk/metabolights) webservices (development server to test new features). You may need to create a DEV account inorder to login and test.

If you would like run your own server, update the origin in /src/app/services/globals.ts file (by default this points to the MetaboLights development server)

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

The editor is configured to connect to a server hosted on the same domain, incase if you want to connect to a server on different domain, update the /src/app/services/globals.ts file (origin) and you may need to enable CORS communication across different domains.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).
