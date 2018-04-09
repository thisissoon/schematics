import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { Schema as ApplicationOptions } from '@schematics/angular/application/schema';
import { Schema as WorkspaceOptions } from '@schematics/angular/workspace/schema';
import * as path from 'path';
import { getDockerReadMeText } from './data';


const angularCollectionPath = path.join(__dirname, '../../node_modules/@schematics/angular/collection.json');
const collectionPath = path.join(__dirname, '../collection.json');

describe('docker', () => {
  const angularSchematicRunner = new SchematicTestRunner(
    '@schematics/angular',
    angularCollectionPath
  );

  const runner = new SchematicTestRunner(
    '@thisissoon/schematics',
    collectionPath
  );

  const workspaceOptions: WorkspaceOptions = {
    name: 'workspace',
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

  describe('SPA app', () => {
    beforeEach(() => {
      appTree = runner.runSchematic('docker', { domain: 'example.com' }, appTree);
    });

    it('should generate files', () => {
      const filePathDocker = '/Dockerfile';
      const filePathNginx = '/nginx.conf';
      expect(appTree.exists(filePathDocker)).toBeTruthy();
      expect(appTree.exists(filePathNginx)).toBeTruthy();
    });

    it('should generate correct Dockerfile template', () => {
      const filePath = '/Dockerfile';
      const contents = appTree.readContent(filePath);
      expect(contents).not.toMatch(/CMD forever/);
      expect(contents).toMatch(/CMD nginx/);
    });
  });

  describe('Universal app', () => {
    beforeEach(() => {
      appTree = runner.runSchematic('docker', { universal: true }, appTree);
    });

    it('should generate files', () => {
      const filePathDocker = '/Dockerfile';
      const filePathNginx = '/nginx.conf';
      expect(appTree.exists(filePathDocker)).toBeTruthy();
      expect(appTree.exists(filePathNginx)).not.toBeTruthy();
    });

    it('should generate correct Dockerfile template', () => {
      const filePath = '/Dockerfile';
      const contents = appTree.readContent(filePath);
      expect(contents).toMatch(/CMD forever/);
      expect(contents).not.toMatch(/CMD nginx/);
    });
  });

  describe('README', () => {
    beforeEach(() => {
      appTree = runner.runSchematic('docker', { domain: 'example.com' }, appTree);
    });

    it('should update README', () => {
      const filePath = '/README.md';
      const contents = appTree.readContent(filePath);
      expect(contents).toContain(getDockerReadMeText('workspace'));
    });
  });

});
