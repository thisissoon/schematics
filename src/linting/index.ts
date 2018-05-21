import {
  Rule,
  SchematicContext,
  Tree,
  chain,
  branchAndMerge,
  mergeWith,
  apply,
  url,
  template
} from '@angular-devkit/schematics';
import { strings } from '@angular-devkit/core';
import * as https from 'https';
import { Subject, Observable } from 'rxjs';
import { addNPMInstallTask } from '../utils/npm';
import { getJsonFile } from '../utils/json';

export default function(options: any): Rule {

  return (tree: Tree, context: SchematicContext) => {
    const templateSource = apply(url('./files'), [
      template({
        ...strings,
        ...options,
      })
    ]);

    addNPMInstallTask(context);

    return chain([
      branchAndMerge(chain([
        mergeWith(templateSource),
        updatePackageJson(),
        updateTslintJson(),
        getSoonEditorConfig()
      ])),
    ])(tree, context);
  };
}

function updatePackageJson(): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const pkgJsonPath = '/package.json';
    const defaultObj = { scripts: {}, dependencies: {} };
    const pkgJson = getJsonFile(pkgJsonPath, tree, defaultObj);

    const angularCliConfigPath = '/angular.json';
    let cliJson = getJsonFile(angularCliConfigPath, tree);
    const appNames = Object.keys(cliJson.projects).map(key => key);

    pkgJson.devDependencies['husky'] = '^0.14.3';
    pkgJson.devDependencies['prettier'] = '^1.11.1';
    pkgJson.devDependencies['pretty-quick'] = '^1.4.1';
    pkgJson.devDependencies['stylelint'] = '^9.2.0';
    pkgJson.devDependencies['stylelint-order'] = '^0.8.1';
    pkgJson.devDependencies['stylelint-config-recommended-scss'] = '^3.2.0';
    pkgJson.devDependencies['stylelint-config-standard'] = '^18.2.0';
    pkgJson.devDependencies['stylelint-scss'] = '^3.0.0';

    pkgJson.scripts['lint:ts'] = 'ng lint';
    pkgJson.scripts['lint:ts:fix'] = appNames.map(name => `ng lint ${name} --fix`).join(' && ');
    pkgJson.scripts['lint:scss'] = 'stylelint --syntax scss \"src/**/*.scss\"';
    pkgJson.scripts['lint'] = 'npm run format:check && npm run lint:ts && npm run lint:scss';
    pkgJson.scripts['format:check'] = 'prettier --config ./.prettierrc -l \"{src/{app,environments,assets}/**/*.{ts,json,css,scss},./*.{ts,js,json,css,scss}}\"';
    pkgJson.scripts['format:fix:staged'] = 'pretty-quick --staged';
    pkgJson.scripts['format:fix:all'] = 'npm run format:check -- --write && npm run lint:scss -- --fix && npm run lint:ts:fix';
    pkgJson.scripts['precommit'] = 'npm run format:fix:staged && npm run lint';

    tree.overwrite(pkgJsonPath, JSON.stringify(pkgJson, null, 2) + '\n');
  }
}

function updateTslintJson(): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const tslintPath = '/tslint.json';
    const defaultObj = { rules: {} };
    const tslintJson = getJsonFile(tslintPath, tree, defaultObj);

    delete tslintJson.rules['comment-format'];
    delete tslintJson.rules['curly'];
    delete tslintJson.rules['eofline'];
    delete tslintJson.rules['import-spacing'];
    delete tslintJson.rules['indent'];
    delete tslintJson.rules['max-line-length'];
    delete tslintJson.rules['no-trailing-whitespace'];
    delete tslintJson.rules['one-line'];
    delete tslintJson.rules['quotemark'];
    delete tslintJson.rules['semicolon'];
    delete tslintJson.rules['typedef-whitespace'];
    delete tslintJson.rules['angular-whitespace'];

    tree.overwrite(tslintPath, JSON.stringify(tslintJson, null, 2) + '\n');
  }
}

function getSoonEditorConfig(): Rule {
  return (tree: Tree, _context: SchematicContext): Observable<Tree> => {
    const editorConfigPath = '/.editorconfig';
    const url = `https://raw.githubusercontent.com/thisissoon/.editorconfig/master/.editorconfig`;
    const subject = new Subject<Tree>();
    const request = https.request(url, response => {
      let data = '';
      response.on('data', chunk => data += chunk);
      response.on('end', () => {
        try {
          tree.overwrite(editorConfigPath, data);
          subject.next(tree);
          subject.complete();
        } catch (err) {
          subject.error(err);
        }
      });
      response.on('error', err => subject.error(err));
    });
    request.end();

    return subject;
  }
}
