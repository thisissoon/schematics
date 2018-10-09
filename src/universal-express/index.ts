import { strings } from '@angular-devkit/core';
import {
  apply,
  branchAndMerge,
  chain,
  externalSchematic,
  mergeWith,
  Rule,
  SchematicContext,
  SchematicsException,
  template,
  Tree,
  url,
} from '@angular-devkit/schematics';
import { Schema as UniversalSchema } from '@schematics/angular/universal/schema';
import { addImportToModule } from '@schematics/angular/utility/ast-utils';
import { InsertChange } from '@schematics/angular/utility/change';
import * as ts from 'typescript';

import { getJsonFile } from '../utils/json';
import { addNPMInstallTask } from '../utils/npm';
import { universalReadMeText } from './data';

export default function(options: UniversalSchema): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const angularCliConfigPath = '/angular.json';
    const cliJson = getJsonFile(angularCliConfigPath, tree);
    options.clientProject = Object.keys(cliJson.projects)[0];

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
          externalSchematic('@schematics/angular', 'universal', options),
          addModuleToServerModule(),
          mergeWith(templateSource),
          updatePackageJson(options),
          updateReadme(),
        ]),
      ),
    ])(tree, context);
  };
}

function updatePackageJson(options: UniversalSchema): Rule {
  return (tree: Tree) => {
    const pkgJsonPath = '/package.json';
    const defaultObj = { scripts: {}, dependencies: {} };
    const pkgJson = getJsonFile(pkgJsonPath, tree, defaultObj);

    pkgJson.dependencies['@nguniversal/express-engine'] = '^6.1.0';
    pkgJson.dependencies['@nguniversal/module-map-ngfactory-loader'] = '^6.1.0';
    pkgJson.dependencies.express = '^4.16.3';
    pkgJson.dependencies['ts-loader'] = '^5.2.1';
    pkgJson.dependencies['webpack-cli'] = '^3.1.2';

    pkgJson.scripts['build:ssr'] =
      'npm run build:client-and-server-bundles && npm run webpack:server';
    pkgJson.scripts['serve:ssr'] = 'node dist/server.js';
    pkgJson.scripts[
      'build:client-and-server-bundles'
    ] = `ng build --prod && ng run ${options.clientProject}:server`;
    pkgJson.scripts['webpack:server'] =
      'webpack --config webpack.server.js --progress --colors';

    tree.overwrite(pkgJsonPath, JSON.stringify(pkgJson, null, 2));
  };
}

function addModuleToServerModule(): Rule {
  return (tree: Tree) => {
    const modulePath = '/src/app/app.server.module.ts';

    const text = tree.read(modulePath);
    if (text === null) {
      throw new SchematicsException(`File ${modulePath} does not exist.`);
    }
    const sourceText = text.toString('utf-8');
    const source = ts.createSourceFile(
      modulePath,
      sourceText,
      ts.ScriptTarget.Latest,
      true,
    );

    const importModulePath = '@nguniversal/module-map-ngfactory-loader';
    const changes = addImportToModule(
      source as any,
      modulePath,
      `ModuleMapLoaderModule`,
      importModulePath,
    );

    const recorder = tree.beginUpdate(modulePath);
    for (const change of changes) {
      if (change instanceof InsertChange) {
        recorder.insertLeft(change.pos, change.toAdd);
      }
    }
    tree.commitUpdate(recorder);

    return tree;
  };
}

function updateReadme(): Rule {
  return (tree: Tree) => {
    const readMeFile = 'README.md';
    const buffer = tree.read(readMeFile);
    let content: string = '';

    if (buffer) {
      content = buffer.toString();
    }

    content += universalReadMeText;

    tree.overwrite(readMeFile, content);

    return tree;
  };
}
