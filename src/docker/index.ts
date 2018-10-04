import {
  Rule,
  SchematicContext,
  Tree,
  chain,
  branchAndMerge,
  mergeWith,
  apply,
  url,
  noop,
  template,
  SchematicsException,
  filter,
} from '@angular-devkit/schematics';
import { strings } from '@angular-devkit/core';

import { DockerSchema } from './schema.model';
import { getPackageName, getPackageManager } from '../utils/npm';
import { getDockerReadMeText } from './data';
import { getJsonFile } from '../utils/json';

export default function(options: DockerSchema): Rule {
  return (tree: Tree, context: SchematicContext) => {
    options.name = getPackageName(tree);
    const cliJson = getJsonFile('/angular.json', tree);
    const defaultProject = Object.keys(cliJson.projects)[0];
    options.distFolder = cliJson.projects[defaultProject].architect.build.options.outputPath;

    options.packageManager = getPackageManager(tree);


    if (tree.exists('/Dockerfile')) {
      throw new SchematicsException('Dockfile already exists');
    }

    if (!options.universal && (!options.domain || !options.domain.length)) {
      throw new SchematicsException('Must specify a domain name for nginx config');
    }

    const templateSource = apply(url('./files'), [
      options.universal ? filter((path) => !path.endsWith('nginx.conf')): noop(),
      template({
        ...strings,
        ...options,
      })
    ]);

    return chain([
      branchAndMerge(chain([
        mergeWith(templateSource),
        updateReadme(options)
      ])),
    ])(tree, context);
  };
}

function updateReadme(options: DockerSchema): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const readMeFile = 'README.md';
    const buffer = tree.read(readMeFile);
    let content: string = '';

    if (buffer) {
      content = buffer.toString();
    }

    content += getDockerReadMeText(options.name);

    tree.overwrite(readMeFile, content);

    return tree;
  }
}


