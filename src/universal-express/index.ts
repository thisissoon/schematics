import {
  Rule,
  SchematicContext,
  Tree,
  chain,
  branchAndMerge,
  mergeWith,
  apply,
  url,
  template,
  externalSchematic,
  SchematicsException
} from '@angular-devkit/schematics';
import { strings } from '@angular-devkit/core';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import { Schema as UniversalSchema } from '@schematics/angular/universal/schema';
import { addImportToModule } from '@schematics/angular/utility/ast-utils';
import { InsertChange } from '@schematics/angular/utility/change';
import * as ts from 'typescript';
import { universalReadMeText } from './data';

export default function(options: UniversalSchema): Rule {

  return (tree: Tree, context: SchematicContext) => {
    // options.clientProject = getProjectName(tree);

    const templateSource = apply(url('./files'), [
      template({
        ...strings,
        ...options,
      })
    ]);

    addNPMInstallTask(context);

    return chain([
      branchAndMerge(chain([
        externalSchematic('@schematics/angular', 'universal', options),
        addModuleToServerModule(),
        mergeWith(templateSource),
        updateCliConfig(),
        updatePackageJson(),
        updateReadme()
      ])),
    ])(tree, context);
  };
}

function updatePackageJson(): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const pkgJsonPath = '/package.json';
    const buffer = tree.read(pkgJsonPath);
    let pkgJson;

    if (buffer === null) {
      pkgJson = { scripts: {}, dependencies: {} };
    } else {
      pkgJson = JSON.parse(buffer.toString());
    }

    pkgJson.dependencies['@nguniversal/express-engine'] = '^5.0.0';
    pkgJson.dependencies['@nguniversal/module-map-ngfactory-loader'] = '^5.0.0';
    pkgJson.dependencies['express'] = '^4.16.3';
    pkgJson.dependencies['ts-loader'] = '^3.5.0';

    pkgJson.scripts['build:ssr'] = 'npm run build:client-and-server-bundles && npm run webpack:server';
    pkgJson.scripts['serve:ssr'] = 'node dist/server.js';
    pkgJson.scripts['build:client-and-server-bundles'] = 'ng build --prod && ng build --prod --app ssr --output-hashing false';
    pkgJson.scripts['webpack:server'] = 'webpack --config webpack.server.js --progress --colors';

    tree.overwrite(pkgJsonPath, JSON.stringify(pkgJson, null, 2));
  }
}

function updateCliConfig(): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const configPath = '/.angular-cli.json';
    const buffer = tree.read(configPath);
    if (buffer === null) {
      return;
    }

    let config = JSON.parse(buffer.toString());

    config.apps[0].outDir = 'dist/browser';
    config.apps[1].outDir = 'dist/server';
    config.apps[1].name = 'ssr';

    tree.overwrite(configPath, JSON.stringify(config, null, 2));
  }
}

function addModuleToServerModule(): Rule {
  return (tree: Tree) => {
    const modulePath = '/src/app/app.server.module.ts';

    const text = tree.read(modulePath);
    if (text === null) {
      throw new SchematicsException(`File ${modulePath} does not exist.`);
    }
    const sourceText = text.toString('utf-8');
    const source = ts.createSourceFile(modulePath, sourceText, ts.ScriptTarget.Latest, true);

    const importModulePath = '@nguniversal/module-map-ngfactory-loader';
    const changes = addImportToModule(
      source,
      modulePath,
      `ModuleMapLoaderModule`,
      importModulePath
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
  return (tree: Tree, _context: SchematicContext) => {
    const readMeFile = 'README.md';
    const buffer = tree.read(readMeFile);
    let content: string = '';

    if (buffer) {
      content = buffer.toString();
    }

    content += universalReadMeText;

    tree.overwrite(readMeFile, content);

    return tree;
  }
}

function addNPMInstallTask(context: SchematicContext) {
  context.addTask(new NodePackageInstallTask());
}
