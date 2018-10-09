import {
  SchematicTestRunner,
  UnitTestTree,
} from '@angular-devkit/schematics/testing';
import { Schema as ApplicationOptions } from '@schematics/angular/application/schema';
import { Schema as WorkspaceOptions } from '@schematics/angular/workspace/schema';
import * as path from 'path';

const angularCollectionPath = path.join(
  __dirname,
  '../../node_modules/@schematics/angular/collection.json',
);
const collectionPath = path.join(__dirname, '../collection.json');

describe('commits', () => {
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
    appTree = runner.runSchematic('commits', {}, appTree);
  });

  it('should update package json', () => {
    const filePath = '/package.json';

    expect(appTree.exists(filePath)).toBeTruthy();
    const contents = JSON.parse(appTree.readContent(filePath));

    expect(contents.devDependencies['cz-conventional-changelog']).toEqual(
      '^2.1.0',
    );
    expect(contents.devDependencies['standard-version']).toEqual('^4.3.0');
    expect(contents.scripts.release).toEqual('standard-version');
  });
});
