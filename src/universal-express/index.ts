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
  externalSchematic
} from '@angular-devkit/schematics';
import { strings } from '@angular-devkit/core';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import { Schema as UniversalSchema } from '@schematics/angular/universal/schema';

export default function(options: UniversalSchema): Rule {
  // console.log(JSON.stringify(options, null, 2));

  return (tree: Tree, context: SchematicContext) => {
    options.clientProject = getProjectName(tree);

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
        mergeWith(templateSource),
        updateCliConfig(),
        updatePackageJson()
      ])),
    ])(tree, context);
  };
}

function getProjectName(tree: Tree): string {
  const buffer = tree.read('/.angular-cli.json');
  let name: string;
  if (buffer === null) {
    name = 'myApp';
  } else {
    name = JSON.parse(buffer.toString()).project.name;
  }
  return name;
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

    pkgJson.dependencies['@nguniversal/express-engine'] = '^5.0.0-beta.5';
    pkgJson.dependencies['@nguniversal/module-map-ngfactory-loader'] = '^5.0.0-beta.5';
    pkgJson.dependencies['express'] = '^4.16.2';
    pkgJson.dependencies['ts-loader'] = '^3.2.0';

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

function addNPMInstallTask(context: SchematicContext) {
  context.addTask(new NodePackageInstallTask());
}
