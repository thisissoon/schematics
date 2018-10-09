import { strings } from '@angular-devkit/core';
import {
  apply,
  branchAndMerge,
  chain,
  mergeWith,
  Rule,
  SchematicContext,
  template,
  Tree,
  url,
} from '@angular-devkit/schematics';
import * as https from 'https';
import { Observable, Subject } from 'rxjs';
import { getJsonFile } from '../utils/json';
import { addNPMInstallTask } from '../utils/npm';

export default function(options: any): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const templateSource = apply(url('./files'), [
      template({
        ...strings,
        ...options,
      }),
    ]);

    addNPMInstallTask(context);

    return chain([
      branchAndMerge(
        chain([
          mergeWith(templateSource),
          updatePackageJson(),
          updateTslintJson(),
          getSoonEditorConfig(),
        ]),
      ),
    ])(tree, context);
  };
}

function updatePackageJson(): Rule {
  return (tree: Tree) => {
    const pkgJsonPath = '/package.json';
    const defaultObj = { scripts: {}, dependencies: {} };
    const pkgJson = getJsonFile(pkgJsonPath, tree, defaultObj);

    pkgJson.devDependencies.husky = '^1.1.0';
    pkgJson.devDependencies['lint-staged'] = '^7.3.0';
    pkgJson.devDependencies.prettier = '^1.14.3';
    pkgJson.devDependencies.stylelint = '^9.6.0';
    pkgJson.devDependencies['stylelint-config-prettier'] = '^4.0.0';
    pkgJson.devDependencies['stylelint-config-recommended-scss'] = '^3.2.0';
    pkgJson.devDependencies['stylelint-config-standard'] = '^18.2.0';
    pkgJson.devDependencies['stylelint-order'] = '^1.0.0';
    pkgJson.devDependencies['stylelint-scss'] = '^3.3.1';
    pkgJson.devDependencies['tslint-config-prettier'] = '^1.15.0';

    pkgJson.scripts.lint =
      'npm run stylelint && npm run nglint && npm run prettier';
    pkgJson.scripts['lint:fix'] =
      'npm run stylelint -- --fix && npm run nglint -- --fix && npm run prettier -- --write';
    pkgJson.scripts.nglint = 'ng lint';
    pkgJson.scripts.stylelint = 'stylelint --syntax scss "src/**/*.{css,scss}"';
    pkgJson.scripts.prettier =
      'prettier --config .prettierrc -l "src/**/*.{ts,js,json,css,scss}"';

    pkgJson.husky = {
      hooks: {
        'pre-commit': 'lint-staged',
      },
    };
    pkgJson['lint-staged'] = {
      'src/**/*.ts': ['tslint --fix', 'git add'],
      'src/**/*.{css,scss}': ['stylelint --syntax scss --fix', 'git add'],
      'src/**/*.{ts,js,json,css,scss}': [
        'prettier --config .prettierrc --write',
        'git add',
      ],
    };

    tree.overwrite(pkgJsonPath, JSON.stringify(pkgJson, null, 2) + '\n');
  };
}

function updateTslintJson(): Rule {
  return (tree: Tree) => {
    const tslintPath = '/tslint.json';
    const defaultObj = { rules: {}, extends: [] };
    const tslintJson = getJsonFile(tslintPath, tree, defaultObj);

    delete tslintJson.rules['comment-format'];
    delete tslintJson.rules.curly;
    delete tslintJson.rules.eofline;
    delete tslintJson.rules['import-spacing'];
    delete tslintJson.rules.indent;
    delete tslintJson.rules['max-line-length'];
    delete tslintJson.rules['no-trailing-whitespace'];
    delete tslintJson.rules['one-line'];
    delete tslintJson.rules.quotemark;
    delete tslintJson.rules.semicolon;
    delete tslintJson.rules['typedef-whitespace'];
    delete tslintJson.rules['angular-whitespace'];

    tslintJson.extends = ['tslint-config-prettier'];

    tree.overwrite(tslintPath, JSON.stringify(tslintJson, null, 2) + '\n');
  };
}

function getSoonEditorConfig(): Rule {
  return (tree: Tree): Observable<Tree> => {
    const editorConfigPath = '/.editorconfig';
    const editorUrl = `https://raw.githubusercontent.com/thisissoon/.editorconfig/master/.editorconfig`;
    const subject = new Subject<Tree>();
    const request = https.request(editorUrl, response => {
      let data = '';
      response.on('data', chunk => (data += chunk));
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
  };
}
