import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { Schema as ApplicationOptions } from '@schematics/angular/application/schema';
import { Schema as WorkspaceOptions } from '@schematics/angular/workspace/schema';
import * as path from 'path';

const angularCollectionPath = path.join(__dirname, '../../node_modules/@schematics/angular/collection.json');
const collectionPath = path.join(__dirname, '../collection.json');

describe('testing', () => {
  const angularSchematicRunner = new SchematicTestRunner(
    '@schematics/angular',
    angularCollectionPath
  );

  const runner = new SchematicTestRunner(
    '@thisissoon/schematics',
    collectionPath
  );

  const workspaceOptions: WorkspaceOptions = {
    name: 'foo',
    newProjectRoot: 'projects',
    version: '1.7.0',
  };

  const appOptions: ApplicationOptions = {
    name: 'bar',
    inlineStyle: false,
    inlineTemplate: false,
    routing: false,
    style: 'css',
    skipTests: false,
    skipPackageJson: false,
    projectRoot: ''
  };

  let appTree: UnitTestTree;

  beforeEach(() => {
    appTree = angularSchematicRunner.runSchematic('workspace', workspaceOptions);
    appTree = angularSchematicRunner.runSchematic('application', appOptions, appTree);
  });

  it('should generate Travis CI config', () => {
    appTree = runner.runSchematic('testing', { ci: 'travis' }, appTree);
    const filePath = '/.travis.yml';
    expect(appTree.exists(filePath)).toBeTruthy();
    const contents = appTree.readContent(filePath);
    expect(contents).toMatch(/TravisCI configuration for foo/);
  });

  it('should generate Circle CI config', () => {
    appTree = runner.runSchematic('testing', { ci: 'circle' }, appTree);
    const filePath = '/.circleci/config.yml';
    expect(appTree.exists(filePath)).toBeTruthy();
    const contents = appTree.readContent(filePath);
    expect(contents).toMatch(/CircleCI configuration for foo/);
  });

  it('should generate GitLab CI config', () => {
    appTree = runner.runSchematic('testing', { ci: 'gitlab' }, appTree);
    const filePath = '/.gitlab-ci.yml';
    expect(appTree.exists(filePath)).toBeTruthy();
    const contents = appTree.readContent(filePath);
    expect(contents).toMatch(/Gitlab configuration for foo/);
  });
});
