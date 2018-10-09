import {
  SchematicTestRunner,
  UnitTestTree,
} from '@angular-devkit/schematics/testing';
import { Schema as ApplicationOptions } from '@schematics/angular/application/schema';
import { Schema as UniversalOptions } from '@schematics/angular/universal/schema';
import { Schema as WorkspaceOptions } from '@schematics/angular/workspace/schema';
import * as path from 'path';

const angularCollectionPath = path.join(
  __dirname,
  '../../node_modules/@schematics/angular/collection.json',
);
const collectionPath = path.join(__dirname, '../collection.json');

describe('universal express', () => {
  const angularSchematicRunner = new SchematicTestRunner(
    '@schematics/angular',
    angularCollectionPath,
  );

  const runner = new SchematicTestRunner(
    '@thisissoon/schematics',
    collectionPath,
  );

  const defaultOptions: UniversalOptions = {
    clientProject: 'bar',
  };

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
    appTree = runner.runSchematic('universal-express', defaultOptions, appTree);
  });

  it('should generate files', () => {
    const filePathWebpack = '/webpack.server.js';
    const filePathServer = '/server.ts';
    expect(appTree.exists(filePathWebpack)).toBeTruthy();
    expect(appTree.exists(filePathServer)).toBeTruthy();
  });

  it('should add module to server module', () => {
    const filePath = '/src/app/app.server.module.ts';
    expect(appTree.exists(filePath)).toBeTruthy();
    const contents = appTree.readContent(filePath);
    expect(contents).toMatch(
      /import { ModuleMapLoaderModule } from '@nguniversal\/module-map-ngfactory-loader'/,
    );
  });

  it('should update package json', () => {
    const filePath = '/package.json';
    expect(appTree.exists(filePath)).toBeTruthy();
    const contents = JSON.parse(appTree.readContent(filePath));
    expect(contents.dependencies['@nguniversal/express-engine']).toEqual(
      '^6.1.0',
    );
    expect(
      contents.dependencies['@nguniversal/module-map-ngfactory-loader'],
    ).toEqual('^6.1.0');
    expect(contents.dependencies.express).toEqual('^4.16.3');
    expect(contents.dependencies['ts-loader']).toEqual('^5.2.1');
    expect(contents.scripts['build:ssr']).toEqual(
      'npm run build:client-and-server-bundles && npm run webpack:server',
    );
    expect(contents.scripts['serve:ssr']).toEqual('node dist/server.js');
    expect(contents.scripts['build:client-and-server-bundles']).toEqual(
      'ng build --prod && ng run bar:server',
    );
    expect(contents.scripts['webpack:server']).toEqual(
      'webpack --config webpack.server.js --progress --colors',
    );
  });
});
