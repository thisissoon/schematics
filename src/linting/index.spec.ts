// import { Tree } from '@angular-devkit/schematics';
import {
  SchematicTestRunner,
  UnitTestTree,
} from '@angular-devkit/schematics/testing';
import { Schema as ApplicationOptions } from '@schematics/angular/application/schema';
import { Schema as WorkspaceOptions } from '@schematics/angular/workspace/schema';
import * as path from 'path';
import { Observable } from 'rxjs/internal/Observable';

const angularCollectionPath = path.join(
  __dirname,
  '../../node_modules/@schematics/angular/collection.json',
);
const collectionPath = path.join(__dirname, '../collection.json');

describe('linting', () => {
  const angularSchematicRunner = new SchematicTestRunner(
    '@schematics/angular',
    angularCollectionPath,
  );

  const runner = new SchematicTestRunner(
    '@thisissoon/schematics',
    collectionPath,
  );

  const workspaceOptions: WorkspaceOptions = {
    name: 'workspace',
    newProjectRoot: 'projects',
    version: '1.7.0',
  };

  const appOptions: ApplicationOptions = {
    inlineStyle: false,
    inlineTemplate: false,
    name: 'bar',
    projectRoot: '',
    routing: false,
    skipPackageJson: false,
    skipTests: false,
    style: 'css',
  };

  let appTree: UnitTestTree;
  let appTreeAsync: Observable<UnitTestTree>;

  beforeEach(() => {
    appTree = angularSchematicRunner.runSchematic(
      'workspace',
      workspaceOptions,
    );
    appTree = angularSchematicRunner.runSchematic(
      'application',
      appOptions,
      appTree,
    );
    appTreeAsync = runner.runSchematicAsync('linting', {}, appTree);
  });

  it('should generate files', done => {
    const filePrettier = '/.prettierrc';
    const fileStylelint = '/.stylelintrc';
    appTreeAsync.subscribe(tree => {
      expect(tree.exists(filePrettier)).toBeTruthy();
      expect(tree.exists(fileStylelint)).toBeTruthy();
      done();
    });
  });

  it('should update package json', done => {
    const filePath = '/package.json';
    appTreeAsync.subscribe(tree => {
      expect(tree.exists(filePath)).toBeTruthy();
      const contents = JSON.parse(tree.readContent(filePath));

      expect(contents.devDependencies.husky).toEqual('^1.1.0');
      expect(contents.devDependencies['lint-staged']).toEqual('^7.3.0');
      expect(contents.devDependencies.prettier).toEqual('^1.14.3');
      expect(contents.devDependencies.stylelint).toEqual('^9.6.0');
      expect(contents.devDependencies['stylelint-config-prettier']).toEqual(
        '^4.0.0',
      );
      expect(
        contents.devDependencies['stylelint-config-recommended-scss'],
      ).toEqual('^3.2.0');
      expect(contents.devDependencies['stylelint-config-standard']).toEqual(
        '^18.2.0',
      );
      expect(contents.devDependencies['stylelint-order']).toEqual('^1.0.0');
      expect(contents.devDependencies['stylelint-scss']).toEqual('^3.3.1');
      expect(contents.devDependencies['tslint-config-prettier']).toEqual(
        '^1.15.0',
      );

      expect(contents.scripts.lint).toEqual(
        'npm run stylelint && npm run nglint && npm run prettier',
      );
      expect(contents.scripts['lint:fix']).toEqual(
        'npm run stylelint -- --fix && npm run nglint -- --fix && npm run prettier -- --write',
      );
      expect(contents.scripts.nglint).toEqual('ng lint');
      expect(contents.scripts.stylelint).toEqual(
        'stylelint --syntax scss "src/**/*.{css,scss}"',
      );
      expect(contents.scripts.prettier).toEqual(
        'prettier --config .prettierrc -l "src/**/*.{ts,js,json,css,scss}"',
      );
      done();
    });
  });

  it('should update tslint json', done => {
    const filePath = '/tslint.json';
    appTreeAsync.subscribe(tree => {
      expect(tree.exists(filePath)).toBeTruthy();
      const contents = JSON.parse(tree.readContent(filePath));

      expect(contents.rules['comment-format']).toBeUndefined();
      expect(contents.rules.curly).toBeUndefined();
      expect(contents.rules.eofline).toBeUndefined();
      expect(contents.rules['import-spacing']).toBeUndefined();
      expect(contents.rules.indent).toBeUndefined();
      expect(contents.rules['max-line-length']).toBeUndefined();
      expect(contents.rules['no-trailing-whitespace']).toBeUndefined();
      expect(contents.rules['one-line']).toBeUndefined();
      expect(contents.rules.quotemark).toBeUndefined();
      expect(contents.rules.semicolon).toBeUndefined();
      expect(contents.rules['typedef-whitespace']).toBeUndefined();
      expect(contents.rules['angular-whitespace']).toBeUndefined();
      done();
    });
  });

  it('should get SOON_ .editorconfig', done => {
    const filePath = '/.editorconfig';
    appTreeAsync.subscribe(tree => {
      expect(tree.exists(filePath)).toBeTruthy();
      const contents = tree.readContent(filePath);

      expect(contents).toContain(
        '# SOON_ Cross team root editorconfig configuration',
      );
      done();
    });
  });
});
