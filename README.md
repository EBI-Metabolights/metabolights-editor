
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

### Development server (Front end)

- [Install angular CLI](https://angular.io/cli) to get started

- Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

Editor by default connects to [MetaboLights DEV](https://wwwdev.ebi.ac.uk/metabolights) webservices (a development server to test new features). You may need to create a DEV account inorder to login and test.

If you would like run your own server, update the origin in /src/app/services/globals.ts file (by default this points to the MetaboLights development server)

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

The editor is configured to connect to a server hosted on the same domain, incase if you want to connect to a server on different domain, update the /src/app/services/globals.ts file (origin) and you may need to enable CORS communication across different domains.
### Configuration

In order to run, there must be at least one configuration file present in the `assets/configs/` directory, and an environment file that defines a few key variables. `context` indicates the deployment context as a string. This variable is used to select the corresponding config file from the `assets/config/` directory. `isTesting` is a flag that is used to prevent the state store being initialized when components are being unit tested. It will be removed in a future release when the store implementation is replaced.

For an example of the values a context.config.json file is supposed to contain, you can consult `src/environment.interface.ts` 

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

---

### Development server (Back end)

[Code base](https://github.com/EBI-Metabolights/MtblsWS-Py) - Python-based REST service